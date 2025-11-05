import { openDB } from 'idb';

const DB_NAME = 'gdrive-cache';
const DB_VERSION = 1;
const STORE_FILES = 'files';
const STORE_METADATA = 'metadata';

let db = null;

// Initialize IndexedDB
export const initCache = async () => {
  try {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Files store: stores file blobs
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          const filesStore = db.createObjectStore(STORE_FILES, { keyPath: 'id' });
          filesStore.createIndex('fileId', 'fileId', { unique: false });
          filesStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }

        // Metadata store: stores file metadata
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          const metaStore = db.createObjectStore(STORE_METADATA, { keyPath: 'id' });
          metaStore.createIndex('fileId', 'fileId', { unique: true });
          metaStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
      },
    });
    console.log('IndexedDB cache initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize IndexedDB cache:', error);
    return false;
  }
};

// Cache file blob
export const cacheFile = async (fileId, fileBlob, metadata = {}) => {
  if (!db) {
    await initCache();
  }

  try {
    const tx = db.transaction([STORE_FILES, STORE_METADATA], 'readwrite');
    
    // Store file blob
    await tx.objectStore(STORE_FILES).put({
      id: `file-${fileId}`,
      fileId,
      blob: fileBlob,
      lastAccessed: Date.now(),
    });

    // Store metadata
    await tx.objectStore(STORE_METADATA).put({
      id: `meta-${fileId}`,
      fileId,
      ...metadata,
      lastAccessed: Date.now(),
    });

    await tx.done;
    
    // Enforce cache size limit (e.g., max 100MB or 50 files)
    await enforceCacheLimits();
    
    return true;
  } catch (error) {
    console.error('Failed to cache file:', error);
    return false;
  }
};

// Get cached file
export const getCachedFile = async (fileId) => {
  if (!db) {
    await initCache();
  }

  try {
    const tx = db.transaction([STORE_FILES, STORE_METADATA], 'readonly');
    
    const fileData = await tx.objectStore(STORE_FILES).get(`file-${fileId}`);
    const metadata = await tx.objectStore(STORE_METADATA).get(`meta-${fileId}`);
    
    if (fileData) {
      // Update last accessed time
      await updateLastAccessed(fileId);
      return {
        blob: fileData.blob,
        metadata: metadata || {},
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get cached file:', error);
    return null;
  }
};

// Get cached metadata only
export const getCachedMetadata = async (fileId) => {
  if (!db) {
    await initCache();
  }

  try {
    const tx = db.transaction(STORE_METADATA, 'readonly');
    const metadata = await tx.objectStore(STORE_METADATA).get(`meta-${fileId}`);
    return metadata || null;
  } catch (error) {
    console.error('Failed to get cached metadata:', error);
    return null;
  }
};

// Update last accessed time
const updateLastAccessed = async (fileId) => {
  try {
    const tx = db.transaction([STORE_FILES, STORE_METADATA], 'readwrite');
    
    const fileData = await tx.objectStore(STORE_FILES).get(`file-${fileId}`);
    if (fileData) {
      fileData.lastAccessed = Date.now();
      await tx.objectStore(STORE_FILES).put(fileData);
    }
    
    const metadata = await tx.objectStore(STORE_METADATA).get(`meta-${fileId}`);
    if (metadata) {
      metadata.lastAccessed = Date.now();
      await tx.objectStore(STORE_METADATA).put(metadata);
    }
    
    await tx.done;
  } catch (error) {
    console.error('Failed to update last accessed:', error);
  }
};

// Enforce cache limits
const enforceCacheLimits = async () => {
  try {
    const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
    const MAX_FILES = 50;

    const tx = db.transaction(STORE_FILES, 'readwrite');
    const store = tx.objectStore(STORE_FILES);
    const files = await store.getAll();

    // Calculate total size
    let totalSize = 0;
    const filesWithSize = await Promise.all(
      files.map(async (file) => {
        const size = file.blob.size || 0;
        totalSize += size;
        return { ...file, size };
      })
    );

    // Sort by last accessed (oldest first)
    filesWithSize.sort((a, b) => a.lastAccessed - b.lastAccessed);

    // Remove files if over limits
    let removed = 0;
    while ((totalSize > MAX_CACHE_SIZE || filesWithSize.length > MAX_FILES) && filesWithSize.length > 0) {
      const file = filesWithSize.shift();
      totalSize -= file.size;
      
      await store.delete(file.id);
      
      // Also remove metadata
      const metaTx = db.transaction(STORE_METADATA, 'readwrite');
      await metaTx.objectStore(STORE_METADATA).delete(`meta-${file.fileId}`);
      await metaTx.done;
      
      removed++;
    }

    if (removed > 0) {
      console.log(`Removed ${removed} cached files to enforce limits`);
    }
  } catch (error) {
    console.error('Failed to enforce cache limits:', error);
  }
};

// Clear all cache
export const clearCache = async () => {
  if (!db) {
    await initCache();
  }

  try {
    const tx = db.transaction([STORE_FILES, STORE_METADATA], 'readwrite');
    await tx.objectStore(STORE_FILES).clear();
    await tx.objectStore(STORE_METADATA).clear();
    await tx.done;
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
};

// Get cache stats
export const getCacheStats = async () => {
  if (!db) {
    await initCache();
  }

  try {
    const tx = db.transaction(STORE_FILES, 'readonly');
    const files = await tx.objectStore(STORE_FILES).getAll();
    
    let totalSize = 0;
    files.forEach((file) => {
      totalSize += file.blob.size || 0;
    });

    return {
      fileCount: files.length,
      totalSize,
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return { fileCount: 0, totalSize: 0 };
  }
};

// Initialize cache on module load
initCache();

