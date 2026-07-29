/**
 * Math Intelligence Studio - Voice Intelligence Engine
 * Hands-free Natural Language Parsing with Web Speech API & Voice Synthesis
 */

window.VoiceEngine = {
  recognition: null,
  synthesis: window.speechSynthesis,
  isListening: false,

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API not supported on this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      const btn = document.getElementById('btn-voice-toggle');
      if (btn) btn.classList.add('listening');
      window.showToast('Voice Intelligence listening... Speak now!', 'info');
    };

    this.recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      window.showToast(`Heard: "${transcript}"`, 'success');
      this.parseAndExecute(transcript);
    };

    this.recognition.onerror = () => {
      this.stop();
    };

    this.recognition.onend = () => {
      this.stop();
    };

    document.getElementById('btn-voice-toggle')?.addEventListener('click', () => {
      this.toggle();
    });
  },

  toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  },

  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {}
    } else if (!this.recognition) {
      window.showToast("Speech Recognition not supported in your browser.", "warning");
    }
  },

  stop() {
    this.isListening = false;
    const btn = document.getElementById('btn-voice-toggle');
    if (btn) btn.classList.remove('listening');
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
  },

  speak(text) {
    if (!this.synthesis) return;
    this.synthesis.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    this.synthesis.speak(utterance);
  },

  parseAndExecute(speech) {
    const lower = speech.toLowerCase().trim();

    // 1. Conversion pattern: "convert 15 miles into kilometers"
    if (lower.includes('convert')) {
      window.WorkspaceManager.openWidget('unit_universe');
      const match = lower.match(/convert\s+([\d\.]+)\s+([a-z\s]+)\s+(to|into)\s+([a-z\s]+)/);
      if (match) {
        const val = match[1];
        const fromUnit = match[2].trim();
        const toUnit = match[4].trim();
        window.EventBus.emit('voice-convert-units', { val, fromUnit, toUnit });
        this.speak(`Converting ${val} ${fromUnit} into ${toUnit}`);
        return;
      }
    }

    // 2. Financial calculation: "calculate compound interest"
    if (lower.includes('compound interest') || lower.includes('simple interest') || lower.includes('emi')) {
      window.WorkspaceManager.openWidget('finance');
      this.speak("Opening Finance Studio");
      return;
    }

    // 3. Graphing pattern: "graph sin(x)" or "plot x squared"
    if (lower.includes('graph') || lower.includes('plot') || lower.includes('draw')) {
      window.WorkspaceManager.openWidget('grapher');
      if (lower.includes('sin')) window.EventBus.emit('voice-plot-equation', 'sin(x)');
      else if (lower.includes('cos')) window.EventBus.emit('voice-plot-equation', 'cos(x)');
      else if (lower.includes('tan')) window.EventBus.emit('voice-plot-equation', 'tan(x)');
      else if (lower.includes('squared') || lower.includes('x^2')) window.EventBus.emit('voice-plot-equation', 'x^2');
      this.speak("Generating graph");
      return;
    }

    // 4. Default math evaluation: "what is square root of 625" or "25 squared plus square root of 144"
    let expr = lower
      .replace(/what is|calculate|solve|the|/g, '')
      .replace(/square root of\s*([\d\.]+)/g, 'sqrt($1)')
      .replace(/([\d\.]+)\s*squared/g, '$1^2')
      .replace(/plus/g, '+')
      .replace(/minus/g, '-')
      .replace(/times|multiplied by/g, '*')
      .replace(/divided by/g, '/')
      .trim();

    window.WorkspaceManager.openWidget('calculator');
    window.EventBus.emit('voice-eval-expression', expr);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.VoiceEngine.init();
});
