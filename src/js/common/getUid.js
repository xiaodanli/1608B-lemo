define(['mui'],function(mui){
	
	function getUid(fn){
		var uid = localStorage.getItem('uid') || '';
		
		if(!uid){
			mui.ajax('/api/users',{
				dataType:'json',
				type:'post',
				success:function(res){
					if(res.code === 1){
						localStorage.setItem('uid',res.uid);
						fn(res.uid);
					}
				}
			})
		}else{
			fn(uid);
		}
	}
	return getUid
})