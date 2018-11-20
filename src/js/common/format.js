define(function(){
	function format(data,num){
		var group = Math.ceil(data.length/num);
		
		var target = [];
		
		for(var i = 0;i < group;i++){
			target.push(data.splice(0,num))
		}
		
		return target
	}
	
	return format
})