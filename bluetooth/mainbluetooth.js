try{
const bleno = require('@abandonware/bleno');
//const bleno = require('@abandonware/bleno');
/*bleno.on('stateChange', function(state) {
    console.log('on stateChange: ' + state);
    if (state === 'poweredOn') {
      bleno.startAdvertising('Glare for 862', ['0862']);
    } else {
      bleno.stopAdvertising();
    }
})*/
var BlenoPrimaryService = bleno.PrimaryService;
var uuid = '0862'
var channelFile = require("./channel")

var channel_1 = channelFile.createChannel('0001', 'Channel 1');
var channel_2 = channelFile.createChannel('0002', 'Channel 2');
var channel_3 = channelFile.createChannel('0003', 'Channel 3');
var channel_4 = channelFile.createChannel('0004', 'Channel 4');
var channel_5 = channelFile.createChannel('0005', 'Channel 5');
var channel_6 = channelFile.createChannel('0006', 'Channel 6');
var channel_7 = channelFile.createChannel('0007', 'Channel 7');
var channel_8 = channelFile.createChannel('0008', 'Channel 8');
}catch(e){
console.log('load fail')
}
exports.startAdvertising = function(uuid){
bleno.on('advertisingStart', function(error) {
        console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
      
        if (!error) {
          bleno.setServices([
            new BlenoPrimaryService({
              uuid: uuid,
              characteristics: [
                new channel_1(),
                new channel_2(),
                new channel_3(),
                new channel_4(),
                new channel_5(),
                new channel_6(),
                new channel_7(),
                new channel_8()
              ]
            })
          ]);
        }
      });
    bleno.on('stateChange', function(state) {
      console.log("Debug 2; " + state)
        if (state === 'poweredOn') {
          bleno.startAdvertising('Glare Bluetooth Service', [uuid]);
        } else {
          bleno.stopAdvertising();
        }
      });

    console.log("(GLog) [" + new Date().toTimeString() + "] Starting Bluetooth Channels...")
    
}
