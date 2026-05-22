import api from './api';

class BehaviorTracker {
  constructor() {
    if (BehaviorTracker.instance) {
      return BehaviorTracker.instance;
    }
    
    this.events = [];
    this.currentKey = null;
    this.lastKeyTime = null;
    this.lastMousePos = null;
    this.lastMouseTime = null;
    this.lastInteractionTime = null;
    
    this.currentEvent = {
      hold_time: 0,
      flight_time: 0,
      mouse_speed: 0,
      click_count: 0
    };
    
    this.interval = null;
    this.inactivityInterval = null;
    this.isTracking = false;
    this.fastTypingCount = 0;
    
    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.sendData = this.sendData.bind(this);
    this.triggerLock = this.triggerLock.bind(this);
    this.updateActivity = this.updateActivity.bind(this);
    
    BehaviorTracker.instance = this;
  }

  start() {
    if (this.isTracking) return;
    
    this.lastInteractionTime = Date.now();
    
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('click', this.handleClick);
    
    this.interval = setInterval(this.sendData, 5000);
    this.inactivityInterval = setInterval(() => {
      const inactiveMs = Date.now() - this.lastInteractionTime;
      
      // Do not lock on login, register, or lock pages
      const path = window.location.pathname;
      if (path === '/login' || path === '/register' || path === '/locked') {
        this.updateActivity(); // keep reset
        return;
      }

      if (inactiveMs >= 30000) {
        console.warn("Inactivity timeout triggered (30 seconds)!");
        this.triggerLock("Session locked due to 30s of inactivity");
      }
    }, 1000);
    
    this.isTracking = true;
  }

  stop() {
    if (!this.isTracking) return;
    
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleClick);
    
    clearInterval(this.interval);
    clearInterval(this.inactivityInterval);
    this.isTracking = false;
  }

  updateActivity() {
    this.lastInteractionTime = Date.now();
  }

  handleKeyDown(e) {
    this.updateActivity();
    const now = Date.now();
    
    // Screenshot detection
    if (e.key === 'PrintScreen' || 
        (e.metaKey && e.shiftKey && (e.key === 'S' || e.key === '3' || e.key === '4')) ||
        (e.ctrlKey && e.shiftKey && e.key === 'S')) {
      console.warn("Screenshot attempt detected!");
      this.triggerLock("Screenshot attempt detected");
      return;
    }

    if (this.lastKeyTime) {
      const flightTime = now - this.lastKeyTime;
      this.currentEvent.flight_time = flightTime;
      
      // Fast typing detection — threshold 25ms (only bots/scripts type this fast)
      // 40ms was too aggressive and caused false locks for fast human typists
      if (flightTime < 25) {
        this.fastTypingCount++;
        if (this.fastTypingCount >= 5) {
          console.warn("Fast typing detected!");
          this.triggerLock("Automated/Fast typing detected");
          return;
        }
      } else {
        this.fastTypingCount = 0;
      }
    }
    this.currentKey = { key: e.key, time: now };
  }

  handleKeyUp(e) {
    this.updateActivity();
    const now = Date.now();
    if (this.currentKey && this.currentKey.key === e.key) {
      this.currentEvent.hold_time = now - this.currentKey.time;
      this.lastKeyTime = now;
      this.pushCurrentEvent();
    }
  }

  handleMouseMove(e) {
    this.updateActivity();
    const now = Date.now();
    if (this.lastMousePos && this.lastMouseTime) {
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dt = Math.max(now - this.lastMouseTime, 1);
      this.currentEvent.mouse_speed = dist / dt;
      
      // Sample mouse movements (approx 10% of standard move events)
      if (Math.random() < 0.1) {
        this.pushCurrentEvent();
      }
    }
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.lastMouseTime = now;
  }

  handleClick(e) {
    this.updateActivity();
    this.currentEvent.click_count += 1;
    this.pushCurrentEvent();
  }
  
  pushCurrentEvent() {
    const eventData = { ...this.currentEvent };
    this.events.push(eventData);
    
    // Broadcast live telemetry for SOC dashboard
    const telemetryEvent = new CustomEvent('biometric_telemetry', { detail: eventData });
    window.dispatchEvent(telemetryEvent);
    
    // Reset click count
    this.currentEvent.click_count = 0;
  }

  triggerLock(reason) {
    const lockData = {
      status: "anomaly",
      message: reason || "Unusual activity detected",
      anomaly_ratio: 1.0
    };
    const event = new CustomEvent('auth_status', { detail: lockData });
    window.dispatchEvent(event);
  }

  async sendData() {
    // Filter out pure mouse/click events (hold_time=0, flight_time=0)
    // The SVM model was trained only on keystroke vectors — sending zeros
    // makes it classify the session as anomalous (false lock)
    const allEvents = [...this.events];
    const eventsToSend = allEvents.filter(
      e => e.hold_time > 0 || e.flight_time > 0
    );
    
    // Hold onto events until we have a mathematically valid block (at least 8 keystrokes)
    // to reduce high variance of small samples and eliminate false anomalies.
    if (eventsToSend.length < 8) {
      return;
    }
    
    this.events = [];
    
    if (eventsToSend.length === 0) return;
    
    try {
      if (window.location.pathname.includes('/train')) {
        this.events = this.events.concat(eventsToSend); 
        return; 
      }
      
      const token = localStorage.getItem('token');
      if (!token || window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/locked') {
         return;
      }

      const res = await api.post('/api/verify', { events: eventsToSend });
      
      // Apply custom client-side sensitivity slider overrides if present
      const threshold = parseFloat(localStorage.getItem('auth_lock_threshold') || '0.6');
      const ratio = res.data.anomaly_ratio;
      
      let finalStatus = res.data.status;
      if (ratio >= threshold) {
        finalStatus = 'anomaly';
      } else if (ratio >= threshold / 2) {
        finalStatus = 'unusual';
      } else {
        finalStatus = 'normal';
      }
      
      const customRes = {
        ...res.data,
        status: finalStatus,
        message: finalStatus === 'anomaly' ? 'Session locked due to unusual behavior' : undefined
      };

      // Store in local history for Security Hub rendering
      const historyStr = localStorage.getItem('auth_verification_history') || '[]';
      const history = JSON.parse(historyStr);
      history.push({
        timestamp: new Date().toLocaleTimeString(),
        ratio: ratio,
        status: finalStatus,
        vectorCount: eventsToSend.length
      });
      localStorage.setItem('auth_verification_history', JSON.stringify(history.slice(-20))); // Keep last 20
      
      const event = new CustomEvent('auth_status', { detail: customRes });
      window.dispatchEvent(event);
      
    } catch (error) {
      if (error.response?.status === 403) {
        const event = new CustomEvent('auth_status', { detail: error.response.data });
        window.dispatchEvent(event);
      }
    }
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

const tracker = new BehaviorTracker();
export default tracker;
