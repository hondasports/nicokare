//----------
// Configuration
//----------
var EMOTIONS = {Blank:'------', Bad:'悪かった', Normal:'ふつう', Good:'良かった'};
var FB_INIT_INFO = {
		appId:'194549987342423',
		cookie:true,
		status:true,
		xfbml:true,
		oauth:true
};

// Define prototype object
var TextUtil = function( string ){
	this.string = string;
	this.emotion = '';
	this.comment = '';

	string.match( /(.+)\s\[(.+)\]/g );
	this.emotion = RegExp.$1;
	this.comment = RegExp.$2;

	if( this.comment == '' ){
		this.emotion = this.string;
	}
};
	TextUtil.prototype = {
		getEmotion : function(){ return this.emotion; },
		getComment : function(){ return this.comment; }
	};

var NICODATA = function(date, emotion, comment){
	this.date		= date;
	this.emotion	= emotion;
	this.comment	= comment;
};
	NICODATA.prototype = {
		getDate : function(){ return this.date; },
		getEmotion : function(){ return this.emotion; },
		getComment : function(){ return this.comment; }
	};
	
var FqlDataHandler = function(){};
	FqlDataHandler.prototype = {
		getData : function(response){
			console.log('bbb');
			var data = new Array();
			for( var index=0 ; index<response.length ; index++ ){
				
				var row			= response[index];
				var dateObj		= new Date( row.created_time * 1000 );
				var textUtil	= new TextUtil( row.message );
				var nicodata	= new NICODATA( formatDatetime(dateObj), 
												textUtil.getEmotion(),
												textUtil.getComment() );

				data.push( nicodata );
			}
			return data;
		},
	};
	
function init(){
	addEmotionContents();
	FB.init( FB_INIT_INFO );
}

function addEmotionContents(){
	for( var key in EMOTIONS ){
		$('#emotion').append( '<option value="' + key + '">' + EMOTIONS[key] + '</option>' );
	}
}

function postMessage(){
	var text = $('#emotion option:selected').text();
	var comment = $('#comment').val();

	if( comment.length ){
		text += " [" + comment + "]";

	}
	console.log('text : ' + text);
	FB.api( '/me/feed', 'post',
		{ message: text },
		function( response ){
			if( !response || response.error ){
				console.log( 'Comment has NOT been posted :' + response.error.message );
				alert( '投稿できませんでした。' );
			} else {
				console.log( 'Comment has been posted' );
				alert( '投稿しました。タイムラインに戻って確認してください。' );
			}
		}
	);
}

function showHistory(){
	console.log('aaa');
	FB.api(
		{
			method: 'fql.query',
			query: 'SELECT post_id, actor_id, created_time, message FROM stream WHERE source_id = me() and app_id=' + FB_INIT_INFO.appId + ' and created_time >= 1345384515 ORDER BY created_time desc LIMIT 500',			
		},
		writeHistory
	);
	console.log('aaa1');
}

function formatDatetime( dateObj ){
	
	var weeks = new Array('日', '月', '火', '水', '木', '金', '土');

	var month  = dateObj.getMonth() + 1;
    var day    = dateObj.getDate();
    var week   = weeks[ dateObj.getDay() ];
    var hour   = dateObj.getHours();
    var minute = dateObj.getMinutes();
    var second = dateObj.getSeconds();
    
	if (month < 10) {month = "0" + month;}
	if (day < 10) {day = "0" + day;}
	if (hour < 10) {hour = "0" + hour;}
	if (minute < 10) {minute = "0" + minute;}
	if (second < 10) {second = "0" + second;}

	return dateObj.getFullYear()  + "/" + month + "/" + day + " (" + week + ") ";
}