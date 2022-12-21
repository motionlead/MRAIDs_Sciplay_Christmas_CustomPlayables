// Shorthands
var c = createjs;

var Track = function () {
  if (typeof userId !== 'undefined') {
    var urlTrack =
      'https://tracking.adikteev.com/apps/ios/com.24option/sessions/cb_custom_tracking/events/EVENT_NAME?idfa=' +
      userId +
      '&adv_user_id=' +
      creativeId +
      '&city=' +
      userId;
  }
  this.urlTrack = urlTrack;
};

var p = c.extend(Track, c.Container);

p.track = function (arg1) {
  console.log('tracking : ' + arg1);
  if (typeof userId === 'undefined' || typeof creativeId === 'undefined') {
    console.error('Tracker Error : please define creative and/or userId');
    return;
  }
  var img = new Image();
  var newUrl = this.urlTrack.replace(/EVENT_NAME/g, arg1);

  img.src = newUrl;
};
module.exports = c.promote(Track, 'Container');
