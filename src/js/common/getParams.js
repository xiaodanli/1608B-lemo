define(function(){
	var url = location.search;
	if(url.indexOf('?') != -1){
		url = url.slice(1);
	}
	
	var bigArr = url.split('&');
	
	var params = {};
	
	bigArr.forEach(function(item){
		var smallArr = item.split('=');
		params[smallArr[0]] = smallArr[1]
	})
	
	return params
})