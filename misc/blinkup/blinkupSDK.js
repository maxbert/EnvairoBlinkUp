/**
 * JavaScript BlinkUp version 0.3.1
 * blinkupSDK module.
 * @module blinkupSDK
 */

'use strict';

var ConfigId = require('./ConfigId');
var DeviceInfo = require('./DeviceInfo');
var flasher = require('./Flasher');
var env = require('./Environment');
var Base64 = require('./Base64');
var _apiBaseURL = 'https://api.electricimp.com';
var _stopPolling = false;

/** StaticAddressing class constructor for static addressing */
module.exports.StaticAddressing = require('./StaticAddressing');

/** NetworkConfig class constructor for imp network configuration */
module.exports.NetworkConfig = require('./NetworkConfig');

/** NetworkProxy class constructor for routing imp traffic through a proxy */
module.exports.NetworkProxy = require('./NetworkProxy');

/** Max time to poll for a device after flash in whole seconds */
module.exports.pollTimeout = 60;

/** If true, prevents the default behavior where a faster flasher is used on mobile devices */
module.exports.preventFastFlashing = false;

var estimatedFrameRate = function () {
  if (!(exports.preventFastFlashing) && env.isOnMobile()) {
    // return 30;
    if (env.isOnIOS()) {
      var iOSVersion = env.iOSMajorVersion();
      var isRetina = (window.devicePixelRatio >= 2);
      if (iOSVersion !== null && iOSVersion < 7) {
        // 30 FPS for iOS Safari less than 7
        return 30;
      } else if (!isRetina) {
        // 30 FPS for non-Retina devices, likely older
        return 30;
      }
    }

    // 60 FPS for general mobile
    return 60;
  } else {
    // 20 FPS for Desktop
    return 20;
  }
};

/**
* During the flashing process this function is called with the progress percentage.
*
* Setting this property will override the default progress bar behaviour.
* Care should be taken when creating the callback as any screen updates may cause
* the BlinkUp to fail on various devices. The SDK will call this method on each
* percentage point change in progress regardless of FPS.
*
* @param {Number} progress Specifies progress of the flash process
* @example
* var blinkup = require('blinkup/blinkupSDK');
* blinkup.progressCallback = function (progress) {
*   // Perform a very fast ui update.
*   // object.style = 'translateZ(0) scale(' + progress / 100.0 + ',1)'
* };
*/
module.exports.progressCallback = null;

/**
* Evaluate if the default progressCallback function will update the progress
* bar. If the progressCalback has been manually set the returned value isn't
* valid.
*
* @param {Number} [overrideFPS] FPS if you will be overridding the default fps
* @returns {Boolean} true if the default progress callback function will update the
*   progress bar, false otherwise.
*/
module.exports.progressCallbackWillOccurr = function (overrideFPS) {
  var fps = estimatedFrameRate();
  if (typeof overrideFPS === 'number') {
    fps = overrideFPS;
  }

  if (fps > 29 || env.isOnFirefox()) {
    return false;
  } else {
    return true;
  }
};

/**
* Get a ConfigId from the Electric Imp API.
*
* @param {string} apiKey Your apiKey from Electric Imp
* @param {string} existingPlanId For production environment, existing Id previously generated by Electric Imp, or null to auto-generate a new plan Id.
* @param {string} environment `production` environment
* @param {module:blinkupSDK~getConfigIdCompletion} callback Called on completion
* @example
* var blinkup = require('blinkup/blinkupSDK');
* blinkup.getConfigId('myElectricImpAPIKey', null, 'production', function (err, configId) {
*   if (err) {
*     // Handle error
*   } else {
*      // The configId has been retrieved.
*      // Generally it should be passed to the startNetworkFlash function
*      var theConfigId = configId;
*   }
* });
*/
module.exports.getConfigId = function (apiKey, existingPlanId, environment, callback) {
  if (apiKey === null) {
    console.log('BU: No API key provided.'); // eslint-disable-line no-console
    return callback('No API key provided.', null);
  }

  if (environment !== 'production') {
    console.log('BU: environment must be production'); // eslint-disable-line no-console
    return callback('Environment must be production', null);
  }

  var encodedKey = Base64.encode(apiKey);
  var url = _apiBaseURL;
  var data = {};

  if (environment === 'production') {
    url += '/v1/setup_tokens';

    if (existingPlanId !== null && typeof existingPlanId === 'string') {
      data.plan_id = existingPlanId;
    }
  } else {
    url += '/enrol';
    data.api_key = apiKey;
  }

  $.ajax({
    type: 'POST',
    url: url,
    data: data,
    crossDomain: true,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization',
                              'Basic ' + encodedKey);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // 400 is returned by production, 403 is from development
      if (jqXHR.statusCode().status === 403 || jqXHR.statusCode().status === 400) {
        return callback('Your API key is invalid for this environment!', null);
      } else if (jqXHR.statusCode().status === 401) {
        return callback('The provided API key must be valid and at least 32 alphanumeric characters long.', null);
      } else if (errorThrown !== null && errorThrown !== '') {
        return callback(errorThrown, null);
      } else {
        return callback('Possible API Key Error', null);
      }
    },
    success: function (token_info) {
      if (token_info.valid_token === false) {
        return callback('Invalid API key', null);
      }

      var planId = token_info.plan_id || token_info.siteids[0];
      var token = token_info.id || token_info.token;

      var configId = new ConfigId({
        token: token,
        planId: planId,
        apiKey: apiKey,
        environment: environment
      });

      return callback(null, configId);
    }
  });
};

/**
* Callback used by getConfigId.
*
* @callback getConfigIdCompletion
* @param {string} error Specifies error, null on success
* @param {module:blinkupSDK~ConfigId} configId ConfigId object containing token and planId information returned by API (null on failure)
*/

/**
* Starts the BlinkUp flash process by targeting the BU-canvas element in the DOM.
*
* @param {module:blinkupSDK~ConfigId} configId The ConfigId with token, planId, apiKey, and type (retrieved by getConfigId)
* @param {module:blinkupSDK~NetworkConfig} networkConfig The network configuration for the wireless network to use
* @param {Object} Flashing parameters {fps: [10-60] (default:60 mobile, 20 browser)}
* @param {callback} callback Callback function for after the BlinkUp flash finishes (with success parameter)
* @example
* var blinkup = require('blinkup/blinkupSDK');
* // configId, networkConfig created elsewhere
* var options = {
* };
* blinkup.startNetworkFlash(configId, networkConfig, options, function () {
*   // Hide the canvas and progress bar now that BlinkUp is complete
*   // hideFlashingElements();
*
*   // Show status of device polling
*   // setInstruction('Gathering device data (' + blinkup.pollTimeout + 's max)');
*   // document.getElementById('status').style.display = 'block';
*   // showPolling();
*
*   // Poll the device for results of the BlinkUp process
*   // getDeviceStatus(configId);
* });
*/
module.exports.startNetworkFlash = function (configId, networkConfig, options, callback) {
  if (typeof callback === 'undefined') {
    callback = options;
    options = {};
  }

  options = options || {};

  if (typeof options.fps === 'number') {
    flasher.maxFPS = options.fps;
  } else {
    flasher.maxFPS = estimatedFrameRate();
  }

  if (typeof exports.progressCallback === 'function') {
    flasher.progressCallback = exports.progressCallback;
  }

  flasher.start(configId, networkConfig, options, function () {
    return callback();
  });
};

/**
* Starts the BlinkUp disconnect process by targeting the BU-canvas element in the DOM.
* @param {Object} options Flashing parameters {fps: [10-60] (default:60 mobile, 20 browser)}
* @param {callback} callback Callback function for after the BlinkUp flash finishes (no parameters)
* @example
* var blinkup = require('blinkup/blinkupSDK');
* blinkup.startDisconnectFlash({}, function () {
*   // Hide the canvas and progress bar now that BlinkUp is complete
*   // hideFlashingElements();
* });
*/
module.exports.startDisconnectFlash = function (options, callback) {
  if (typeof callback === 'undefined') {
    callback = options;
    options = {};
  }

  options = options || {};

  if (typeof options.fps === 'number') {
    flasher.maxFPS = options.fps;
  } else {
    flasher.maxFPS = estimatedFrameRate();
  }

  if (typeof exports.progressCallback === 'function') {
    flasher.progressCallback = exports.progressCallback;
  }

  flasher.startDisconnect(options, function () {
    return callback();
  });
};

/**
* Cancel any active Device Polling
*
*/
module.exports.stopPolling = function () {
  _stopPolling = true;
};

/**
* Cancel any active BlinkUp flashing
*
*/
module.exports.stopFlash = function () {
  flasher.stop();
};

/**
* Polls the Electric Imp server to gather information about the recently flashed
* device.
*
* @param {module:blinkupSDK~ConfigId} configId The ConfigId used during present
* @param {module:blinkupSDK~pollForDeviceInfoCompletion} callback Callback function for after device has been polled
* @example
* var blinkup = require('blinkup/blinkupSDK');
* blinkup.pollForDeviceInfo (configId, function(err, deviceInfo) {
*   if (err) {
*     // Handle error
*     // (device rejected or server connection timed out)
*   } else if (deviceInfo) {
*     // Do something with deviceInfo data
*   }
* });
*/
module.exports.pollForDeviceInfo = function (configId, callback) {
  var encodedKey = Base64.encode(configId.apiKey);
  var url = _apiBaseURL;
  if (configId.environment === 'production') {
    url += '/v1/setup_tokens/' + configId.token;
  }
  _stopPolling = false;
  var timedOut = false;
  // If we are using the dev endpoint, discard the first result if
  // it returns valid data as it is almost surely old data
  var discardBecauseFirstDev = true;
  var pollTimeoutId = setTimeout(function () {
    timedOut = true;
  }, exports.pollTimeout * 1000);

  var pollIntervalId = setInterval(function () {
    if (_stopPolling === true) {
      clearTimeout(pollTimeoutId);
      clearInterval(pollIntervalId);
      return;
    } else if (timedOut) {
      clearInterval(pollIntervalId);
      return callback('Timeout waiting for device to connect', null);
    } else {
      $.ajax({
        type: 'GET',
        url: url,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization',
                                  'Basic ' + encodedKey);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          return callback(errorThrown, null);
        },
        success: function (data) {
          if (_stopPolling === true || timedOut === true) {
            clearInterval(pollIntervalId);
            return;
          }


          if (configId.environment === 'production') {
            if (data.impee_id !== '') {
              clearInterval(pollIntervalId);
              clearTimeout(pollTimeoutId);
              var deviceInfo = new DeviceInfo({ // eslint-disable-line no-redeclare
                agentURL: data.agent_url,
                deviceId: data.impee_id,
                planId: data.plan_id,
                verificationDate: data.claimed_at
              });

              return callback(null, deviceInfo);
            }
          }
        }
      });
    }
  }, 1000);
};

/**
* Callback used by pollForDeviceInfo.
*
* @callback pollForDeviceInfoCompletion
* @param {string} error Specifies error, null on success
* @param {module:blinkupSDK~DeviceInfo} data Device information for successfully Blinked Up device (null on failure)
*/
