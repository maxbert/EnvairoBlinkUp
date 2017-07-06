'use strict';

var StaticAddressing = require('./StaticAddressing');
var NetworkProxy = require('./NetworkProxy');

/**
 * Represents the configuration for a network connection.
 * @class
 * @classdesc Represents the configuration for a network connection.
 * @memberof module:blinkupSDK~
 * @static
 * @param {object} params Initialization parameters
 * @param {string} params.ssid The SSID of the wireless network
 * @param {string} [params.password] The password for the wifi network
 * @param {StaticAddressing} [params.addressing] The static IP information for the wifi network
 * @param {NetworkProxy} [params.proxy] The proxy information for the wifi network
 * @see module:blinkupSDK~StaticAddressing
 * @see module:blinkupSDK~NetworkProxy
 * @example
 * // Wireless network with SSID and password
 * var blinkup = require('blinkup/blinkupSDK');
 * var networkConfig = new blinkup.NetworkConfig({ssid: 'myWifi', password: 'secret'});
 * @example
 * // Wireless network with SSID, password, static network, and proxy
 * var blinkup = require('blinkup/blinkupSDK');
 * var addressing = new blinkup.StaticAddressing({ip: '192.168.1.200', netmask: '255.255.0.0', gateway: '192.168.1.1', dns1: '8.8.8.8'});
 * var proxy = new blinkup.NetworkProxy({server: 'proxyServer2.local', port: '8000'});
 * var networkConfig = new blinkup.NetworkConfig({ssid: 'myWifi', password: 'secret', addressing: addressing, proxy: proxy});
 * @example
 * // Use Globals rather than modules
 * // Wireless network with SSID, password, static network, and proxy
 * var networkConfig = new BU.NetworkConfig({ssid: 'myWifi', password: 'secret'});
 */
function NetworkConfig (params) {
  /** The SSID of the wireless network */
  this.ssid = params.ssid;
  /** The password for the wifi network */
  this.password = params.password || '';
  /** (Optional) The static IP information for the wifi network */
  this.addressing = params.addressing ? new StaticAddressing(params.addressing) : null;
  /** (Optional) The proxy information for the wifi network */
  this.proxy = params.proxy ? new NetworkProxy(params.proxy) : null;
};

/** Validates that the object represents a valid network configuration */
NetworkConfig.prototype.isComplete = function () {
  return (typeof this.ssid === 'string' && this.ssid !== '');
};

module.exports = NetworkConfig;
