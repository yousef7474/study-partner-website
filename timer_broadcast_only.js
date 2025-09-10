// Alternative timer synchronization using only Supabase broadcast
// This doesn't require creating a database table
// Replace the timer-related functions with these if you prefer not to create the database table

// -------- TIMER BROADCAST-ONLY APPROACH --------
let roomTimerState = {
  isRunning: false,
  seconds: 1500,
  duration: 1500,
  startedBy: null,
  startTime: null
};

function setupTimerBroadcast() {
  if (!currentRoom || !timerSubscription) return;
  
  // Listen for timer broadcasts
  timerSubscription.on('broadcast', { event: 'timer_sync' }, (payload) => {
    console.log('Timer sync received:', payload);
    handleTimerSync(payload.payload);
  });
}

function handleTimerSync(data) {
  if (data.action === 'start') {
    roomTimerState = {
      isRunning: true,
      seconds: data.seconds,
      duration: data.duration,
      startedBy: data.startedBy,
      startTime: data.startTime
    };
    
    timerSeconds = data.seconds;
    timerDuration = data.duration;
    timerStartedBy = data.startedBy;
    
    updateTimerDisplay();
    updateProgressBar();
    updateTimerStatus(`Started by ${data.startedBy}`);
    
    if (!timerRunning) {
      startTimerCountdown();
    }
  } else if (data.action === 'stop' || data.action === 'reset') {
    roomTimerState.isRunning = false;
    resetTimerUI();
  }
}

function broadcastTimerStart() {
  if (!timerSubscription) return;
  
  const payload = {
    action: 'start',
    seconds: timerSeconds,
    duration: timerDuration,
    startedBy: currentUser.name,
    startTime: Date.now()
  };
  
  timerSubscription.send({
    type: 'broadcast',
    event: 'timer_sync',
    payload
  });
}

function broadcastTimerStop() {
  if (!timerSubscription) return;
  
  timerSubscription.send({
    type: 'broadcast',
    event: 'timer_sync',
    payload: { action: 'stop' }
  });
}

// Replace the existing timer functions with these:
async function startTimer_broadcast() {
  if (timerRunning || !currentRoom) return;
  
  timerDuration = timerSeconds;
  timerStartedBy = currentUser.name;
  
  broadcastTimerStart();
  startTimerCountdown();
  updateTimerStatus(`Started by ${currentUser.name}`);
}

async function pauseTimer_broadcast() {
  if (!currentRoom) return;
  
  broadcastTimerStop();
  resetTimerUI();
}

async function resetTimer_broadcast() {
  if (currentRoom) {
    broadcastTimerStop();
  }
  resetTimerUI();
}

// Call this when setting up room subscriptions
function initializeBroadcastTimer() {
  setupTimerBroadcast();
}