var util = require('util');

var bleno = require('@abandonware/bleno');
const notify = require('./updateHandler')

var currentMessages = [];

class QueuedMessageIn{
    constructor(deviceId, requestType, currentHeader, currentData, ended, communicationId, messages){
        this.deviceId = deviceId;
        this.requestType = requestType;
        this.currentHeader = currentHeader;
        this.currentData = currentData;
        this.ended = ended;
        this.communicationId = communicationId;
        this.messages = messages;
    }
}

var globChannelNum = 0;

function handleCheckMessage(handleObject){
	if(handleObject.ended){
	notify.emit('metadataTest', handleObject)	
	notify.emit('channelUpdate', globChannelNum, 'written', {});
            notify.emit('requestTrack', { 'channelNumber' : globChannelNum,'addedAt' : new Date(), 'requestType' : handleObject.requestType, 'numMessages' : handleObject.messages, 'successful' : true, 'data' : handleObject.currentData, 'fromId' : handleObject.deviceId, 'direction' : 'In'})	
// actually send back request object now
	//channelMessages.splice(handleObject, 1);
	}
}

exports.createChannel = function(uuid, loggingName, channelNum){
    var BlenoCharacteristic = bleno.Characteristic;
    globChannelNum = channelNum;
    var thischannel = function() {
        thischannel.super_.call(this, {
        uuid: uuid,
        properties: ['read', 'write', 'notify'],
        value: null
    });

    this._value = new Buffer(0);
    this._updateValueCallback = null;
    };
    notify.emit('channelUpdate', channelNum, 'Online', {});
    util.inherits(thischannel, BlenoCharacteristic);

    if(loggingName != undefined){
        // this channel should be logged
        thischannel.prototype.onReadRequest = function(offset, callback) {
            console.log("(GLog) [" + new Date().toTimeString() + "] " + loggingName + " has had its value read by a client!");
            notify.emit('channelUpdate', channelNum, 'read', {});
            callback(this.RESULT_SUCCESS, this._value);
          };
          
          
          
        thischannel.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
            console.log("(GLog) [" + new Date().toTimeString() + "] " + loggingName + " has lost a client");
            notify.emit('channelUpdate', channelNum, 'subscribed', {});
            this._updateValueCallback = updateValueCallback;
        };
        
        thischannel.prototype.onUnsubscribe = function() {
            console.log("(GLog) [" + new Date().toTimeString() + "] " + loggingName + " has gained a client!");
            notify.emit('channelUpdate', channelNum, 'unsubscribed', {});
            this._updateValueCallback = null;
        };

        thischannel.prototype.onWriteRequest = function(data, offset, withoutResponse, callback){
            this._value = data;
            var hextocheck = this._value.toString('hex');
            var teamIdentifier = hextocheck.substring(0,4)
            var deviceId = hextocheck.substring(4,12)
            var protocolId = hextocheck.substring(12,20)
            var isEnd = hextocheck.substring(20,22) == "ee" ? true : false
            var messageNumber = hextocheck.substring(22,26);
            var communicationId = hextocheck.substring(26,34);
//notify.emit("metadataTest",new QueuedMessageIn(deviceId, protocolId, hextocheck.substring(0,34), hex2a(hextocheck.substring(34)), isEnd, communicationId, 1)) 
            if(currentMessages.find(msg => msg.communicationId == communicationId) == undefined){
                currentMessages.push(new QueuedMessageIn(deviceId, protocolId, hextocheck.substring(0,34), hex2a(hextocheck.substring(34)), isEnd, communicationId, 1));
                //console.log(currentMessages)
            }else{
                var indexToUse = currentMessages.findIndex(msg => msg.communicationId == communicationId);
                currentMessages[indexToUse].ended = isEnd;
                currentMessages[indexToUse].messages = currentMessages[indexToUse].messages + 1
		currentMessages[indexToUse].currentData = currentMessages[indexToUse].currentData + hex2a(hextocheck.substring(34))
                if(currentMessages[indexToUse].messages != messageNumber){
                    notify.emit('communicationError', currentMessages[indexToUse]);
                }
            }
            handleCheckMessage(currentMessages.find(msg => msg.communicationId == communicationId));
            
            var rawstring = hex2a(hextocheck)
            
            console.log("(GLog) [" + new Date().toTimeString() + "] " + loggingName + " has sent '" + rawstring + "'");
            callback(this.RESULT_SUCCESS)        
        }
    }
    

    return thischannel;
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }
