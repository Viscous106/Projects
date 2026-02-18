// WebSocket service for real-time comments
class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.fileId = null;
  }

  connect(fileId, token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.fileId === fileId) {
      return; // Already connected to this file
    }

    this.fileId = fileId;
    const wsUrl = `ws://localhost:1030/api/ws/comments/${fileId}?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected for file:', fileId);
        this.reconnectAttempts = 0;
        this.emit('open');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.emit('close');
        this.attemptReconnect(token);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.emit('error', error);
    }
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.fileId) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(this.fileId, token);
      }, this.reconnectDelay);
    } else {
      console.log('Max reconnect attempts reached. Falling back to polling.');
      this.emit('reconnect-failed');
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not open. Cannot send message.');
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.fileId = null;
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
const wsService = new WebSocketService();

export default wsService;

