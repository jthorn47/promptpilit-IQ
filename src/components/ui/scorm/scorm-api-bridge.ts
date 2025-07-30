// export const createScormBridge = () => ` 
// <script>
// (function() {
//   console.log('🎓 Injecting SCORM API bridge');

//   var scormData = {
//     lessonStatus: 'not attempted',
//     score: '',
//     sessionTime: '',
//     suspendData: '',
//     initialized: false,
//     error: '0'
//   };
//   var startTime = new Date();

//   function notifyParent(method, args, result) {
//     try {
//       parent.postMessage({
//         type: 'SCORM_API_CALL',
//         method: method,
//         args: args,
//         result: result,
//         scormData: scormData
//       }, '*');
//     } catch(e) {
//       console.warn('🎓 Could not notify parent:', e);
//     }
//   }

//   // THE FULL SCORM API:
//   window.API = {
//     LMSInitialize: function(param) { scormData.initialized = true; scormData.error = '0';
//       notifyParent('LMSInitialize', [param], 'true'); return 'true'; },
//     LMSFinish: function(param) {
//       var endTime = new Date();
//       var sec = Math.floor((endTime - startTime) / 1000);
//       scormData.sessionTime = String(Math.floor(sec/3600)).padStart(2,'0')+':' +
//                               String(Math.floor(sec/60)%60).padStart(2,'0')+':' +
//                               String(sec%60).padStart(2,'0');
//       scormData.initialized = false; scormData.error = '0';
//       notifyParent('LMSFinish', [param], 'true'); return 'true'; },
//     LMSGetValue: function(el) {
//       scormData.error = scormData.initialized ? '0' : '301';
//       var v = {
//         'cmi.core.lesson_status': scormData.lessonStatus,
//         'cmi.core.student_id': 'student_123',
//         'cmi.core.student_name': 'Test Student',
//         'cmi.core.score.raw': scormData.score,
//         'cmi.suspend_data': scormData.suspendData,
//         'cmi.core.session_time': scormData.sessionTime
//       }[el] ?? ''; notifyParent('LMSGetValue', [el], v); return v; },
//     LMSSetValue: function(el, val) {
//       scormData.error = scormData.initialized ? '0' : '301';
//       if (el==='cmi.core.lesson_status') scormData.lessonStatus = val;
//       if (el==='cmi.core.score.raw') scormData.score = val;
//       if (el==='cmi.suspend_data') scormData.suspendData = val;
//       notifyParent('LMSSetValue', [el, val], 'true'); return 'true'; },
//     LMSCommit: function() { scormData.error = '0';
//       notifyParent('LMSCommit', [], 'true'); return 'true'; },
//     LMSGetLastError: () => scormData.error,
//     LMSGetErrorString: e => ({'0':'No error','301':'Not initialized','405':'Incorrect data type'})[e]||'Unknown',
//     LMSGetDiagnostic: e => 'Error '+e
//   };

//   window.API_1484_11 = window.API;

//   // Let parent know SCORM is ready
//   parent.postMessage({ type: 'SCORM_API_READY' }, '*');

//   console.log('🎓 SCORM bridge fully ready');
// })();
// </script>
// `;



// export const createScormBridge = () => ` 
// <script>
// (function() {
//   console.log('🎓 Injecting minimal SCORM bridge for M');
//   window.M = {
//     Initialize: function() {
//       console.log("🎓 M.Initialize called");
//       return true;
//     },
//     Commit: function() {
//       console.log("🎓 M.Commit called");
//       return true;
//     },
//     Finish: function() {
//       console.log("🎓 M.Finish called");
//       return true;
//     }
//   };
//   console.log('🎓 window.M bridge injected');
// })();
// </script>
// `;


// export const createScormBridge = () => {
//   return `
//     <script>
//       console.log('🎓 SCORM API Bridge initializing...');
      
//       // SCORM API Bridge using postMessage for cross-origin communication
//       window.API = {
//         LMSInitialize: function(parameter) {
//           console.log('🎓 LMSInitialize called with:', parameter);
//           window.parent.postMessage({
//             type: 'SCORM_API_CALL',
//             method: 'LMSInitialize',
//             parameter: parameter
//           }, '*');
//           return 'true';
//         },
        
//         LMSFinish: function(parameter) {
//           console.log('🎓 LMSFinish called with:', parameter);
//           window.parent.postMessage({
//             type: 'SCORM_API_CALL',
//             method: 'LMSFinish',
//             parameter: parameter
//           }, '*');
//           return 'true';
//         },
        
//         LMSGetValue: function(element) {
//           console.log('🎓 LMSGetValue called with:', element);
//           window.parent.postMessage({
//             type: 'SCORM_API_CALL',
//             method: 'LMSGetValue',
//             parameter: element
//           }, '*');
          
//           // Return appropriate default values
//           switch(element) {
//             case 'cmi.core.lesson_status':
//               return 'not attempted';
//             case 'cmi.core.lesson_location':
//               return '';
//             case 'cmi.core.score.raw':
//               return '';
//             case 'cmi.core.session_time':
//               return '00:00:00';
//             case 'cmi.core.student_id':
//               return 'student_001';
//             case 'cmi.core.student_name':
//               return 'Demo Student';
//             default:
//               return '';
//           }
//         },
        
//         LMSSetValue: function(element, value) {
//           console.log('🎓 LMSSetValue called with:', element, '=', value);
//           window.parent.postMessage({
//             type: 'SCORM_API_CALL',
//             method: 'LMSSetValue',
//             parameter: element,
//             value: value
//           }, '*');
//           return 'true';
//         },
        
//         LMSCommit: function(parameter) {
//           console.log('🎓 LMSCommit called with:', parameter);
//           window.parent.postMessage({
//             type: 'SCORM_API_CALL',
//             method: 'LMSCommit',
//             parameter: parameter
//           }, '*');
//           return 'true';
//         },
        
//         LMSGetLastError: function() {
//           return '0';
//         },
        
//         LMSGetErrorString: function(errorCode) {
//           return 'No error';
//         },
        
//         LMSGetDiagnostic: function(errorCode) {
//           return 'No diagnostic';
//         }
//       };
      
//       // Also create API_1484_11 for SCORM 2004 compatibility
//       window.API_1484_11 = {
//         Initialize: function(parameter) {
//           console.log('🎓 SCORM 2004 Initialize called');
//           return window.API.LMSInitialize(parameter);
//         },
        
//         Terminate: function(parameter) {
//           console.log('🎓 SCORM 2004 Terminate called');
//           return window.API.LMSFinish(parameter);
//         },
        
//         GetValue: function(element) {
//           console.log('🎓 SCORM 2004 GetValue called with:', element);
//           return window.API.LMSGetValue(element);
//         },
        
//         SetValue: function(element, value) {
//           console.log('🎓 SCORM 2004 SetValue called with:', element, '=', value);
//           return window.API.LMSSetValue(element, value);
//         },
        
//         Commit: function(parameter) {
//           console.log('🎓 SCORM 2004 Commit called');
//           return window.API.LMSCommit(parameter);
//         },
        
//         GetLastError: function() {
//           return '0';
//         },
        
//         GetErrorString: function(errorCode) {
//           return 'No error';
//         },
        
//         GetDiagnostic: function(errorCode) {
//           return 'No diagnostic';
//         }
//       };
      
//       console.log('🎓 SCORM API Bridge ready - both API and API_1484_11 available');
//     </script>
//   `;
// };




export const createScormBridge = (settings?: any) => {
  const playerSettings = settings || {
    allowFastForward: false,
    allowRewind: false,
    allowSeek: false,
    allowKeyboardShortcuts: false,
    showProgressBar: false,
    allowVolumeControl: true,
  };

  return `
    <style>
      ${!playerSettings.showProgressBar ? `/* Hide progress bars and seek controls */
      .progress-bar, .seek-bar, .scrub-bar, .timeline, .progress-slider,
      [class*="progress"]:not([class*="play"]):not([class*="pause"]), 
      [class*="seek"], [class*="scrub"], [class*="timeline"],
      [class*="slider"]:not([class*="volume"]):not([class*="play"]):not([class*="pause"]), 
      [class*="seekbar"], [class*="progressbar"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }` : ''}
      
      ${!playerSettings.allowFastForward ? `/* Hide fast forward buttons */
      .fast-forward, .ff-button, .skip-forward, .next-button,
      [class*="fast"], [class*="skip"], 
      [class*="forward"]:not([class*="play"]):not([class*="pause"]), 
      [class*="next"]:not([class*="play"]):not([class*="pause"]),
      [title*="fast"], [title*="skip"], 
      [title*="forward"]:not([title*="play"]):not([title*="pause"]), 
      [title*="next"]:not([title*="play"]):not([title*="pause"]) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }` : ''}

      ${!playerSettings.allowVolumeControl ? `/* Hide volume controls */
      [class*="volume"], [class*="mute"], .volume-control, .mute-button {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }` : ''}
      
      /* Allow play/pause buttons to remain visible */
      [class*="play"], [class*="pause"], [title*="play"], [title*="pause"],
      .play-button, .pause-button, .play-pause-button {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      
      /* Disable text selection but allow interaction with controls */
      video, audio {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    </style>
    <script>
      console.log('🎓 SCORM API Bridge initializing with settings:', ${JSON.stringify(playerSettings)});

      function sendToParent(method, parameter, value) {
        try {
          // Only send postMessage if we're actually in an iframe
          if (window.parent && window.parent !== window && window.top !== window) {
            window.parent.postMessage({
              type: 'SCORM_API_CALL',
              method: method,
              parameter: parameter,
              value: value
            }, '*');
          }
        } catch (error) {
          // Silently handle cross-origin errors to prevent console spam
          console.debug('SCORM postMessage skipped:', error.message);
        }
      }

      // Conditionally apply restrictions based on settings
      function applyPlayerRestrictions() {
        console.log('🎓 Applying player restrictions...');
        
        ${!playerSettings.allowKeyboardShortcuts ? `// Disable keyboard shortcuts
        document.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || 
              e.key === 'PageUp' || e.key === 'PageDown' ||
              (e.key >= '0' && e.key <= '9')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎓 Blocked keyboard shortcut:', e.key);
            return false;
          }
          ${playerSettings.allowSeek ? '' : '// Block spacebar seeking but allow play/pause via buttons'}
        }, true);` : ''}
        
        ${!playerSettings.allowSeek ? `// Disable mouse wheel seeking on video elements
        document.addEventListener('wheel', function(e) {
          if (e.target.tagName === 'VIDEO' || e.target.tagName === 'AUDIO') {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }, true);` : ''}
        
        // Remove elements based on settings
        function removeRestrictedElements() {
          const restrictedSelectors = [];
          
          ${!playerSettings.showProgressBar ? `restrictedSelectors.push(
            '.progress-bar', '.seek-bar', '.scrub-bar', '.timeline', '.progress-slider',
            '[class*="progress"]:not([class*="play"]):not([class*="pause"])', 
            '[class*="seek"]', '[class*="scrub"]', '[class*="timeline"]',
            '[class*="slider"]:not([class*="volume"])', '[class*="seekbar"]', '[class*="progressbar"]'
          );` : ''}
          
          ${!playerSettings.allowFastForward ? `restrictedSelectors.push(
            '.fast-forward', '.ff-button', '.skip-forward', '.next-button',
            '[class*="fast"]', '[class*="skip"]', '[class*="forward"]:not([class*="play"])', '[class*="next"]',
            '[title*="fast"]', '[title*="skip"]', '[title*="forward"]:not([title*="play"])', '[title*="next"]'
          );` : ''}

          ${!playerSettings.allowVolumeControl ? `restrictedSelectors.push(
            '[class*="volume"]', '[class*="mute"]', '.volume-control', '.mute-button'
          );` : ''}
          
          restrictedSelectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => {
                // Don't hide essential play/pause buttons
                if (el.className.includes('play') || el.className.includes('pause') ||
                    el.title?.includes('play') || el.title?.includes('pause')) {
                  return;
                }
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
              });
            } catch (e) {
              // Ignore selector errors
            }
          });
        }
        
        // Run periodically to catch dynamically added elements
        setInterval(removeRestrictedElements, 2000);
        
        ${!playerSettings.allowSeek ? `// Track video time to prevent seeking
        let videoElements = new Map();
        
        function monitorVideos() {
          const videos = document.querySelectorAll('video, audio');
          videos.forEach(video => {
            if (!videoElements.has(video)) {
              videoElements.set(video, {
                lastTime: 0,
                allowedTime: 0
              });
              
              video.addEventListener('timeupdate', function() {
                const data = videoElements.get(this);
                if (data) {
                  const currentTime = this.currentTime;
                  const timeDiff = Math.abs(currentTime - data.lastTime);
                  
                  // If time jumped more than 2 seconds, it's likely seeking
                  if (timeDiff > 2 && data.lastTime > 0) {
                    console.log('🎓 Seeking detected, reverting to:', data.allowedTime);
                    this.currentTime = data.allowedTime;
                  } else {
                    data.allowedTime = currentTime;
                  }
                  data.lastTime = currentTime;
                }
              });
            }
          });
        }
        
        // Monitor for new video elements
        setInterval(monitorVideos, 1000);
        monitorVideos();` : ''}
      }

      window.API = {
        LMSInitialize: function(param) {
          console.log('🎓 LMSInitialize:', param);
          sendToParent('LMSInitialize', param);
          return 'true';
        },
        LMSFinish: function(param) {
          console.log('🎓 LMSFinish:', param);
          sendToParent('LMSFinish', param);
          return 'true';
        },
        LMSGetValue: function(element) {
          console.log('🎓 LMSGetValue:', element);
          sendToParent('LMSGetValue', element);
          switch(element) {
            case 'cmi.core.lesson_status': return 'not attempted';
            case 'cmi.core.lesson_location': return '';
            case 'cmi.core.score.raw': return '';
            case 'cmi.core.session_time': return '00:00:00';
            case 'cmi.core.student_id': return 'student_001';
            case 'cmi.core.student_name': return 'Demo Student';
            default: return '';
          }
        },
        LMSSetValue: function(element, value) {
          console.log('🎓 LMSSetValue:', element, '=', value);
          sendToParent('LMSSetValue', element, value);
          return 'true';
        },
        LMSCommit: function(param) {
          console.log('🎓 LMSCommit:', param);
          sendToParent('LMSCommit', param);
          return 'true';
        },
        LMSGetLastError: function() {
          return '0';
        },
        LMSGetErrorString: function(code) {
          return 'No error';
        },
        LMSGetDiagnostic: function(code) {
          return 'No diagnostic';
        }
      };

      window.API_1484_11 = {
        Initialize: function(param) {
          console.log('🎓 SCORM 2004 Initialize:', param);
          return window.API.LMSInitialize(param);
        },
        Terminate: function(param) {
          console.log('🎓 SCORM 2004 Terminate:', param);
          return window.API.LMSFinish(param);
        },
        GetValue: function(element) {
          console.log('🎓 SCORM 2004 GetValue:', element);
          return window.API.LMSGetValue(element);
        },
        SetValue: function(element, value) {
          console.log('🎓 SCORM 2004 SetValue:', element, '=', value);
          return window.API.LMSSetValue(element, value);
        },
        Commit: function(param) {
          console.log('🎓 SCORM 2004 Commit:', param);
          return window.API.LMSCommit(param);
        },
        GetLastError: function() {
          return '0';
        },
        GetErrorString: function(code) {
          return 'No error';
        },
        GetDiagnostic: function(code) {
          return 'No diagnostic';
        }
      };

      // Apply restrictions when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyPlayerRestrictions);
      } else {
        applyPlayerRestrictions();
      }

      console.log('🎓 SCORM API Bridge ready with configurable settings');
    </script>
  `;
};

