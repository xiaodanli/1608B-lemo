require.config({
	baseUrl:'/js/',
	paths:{
		'mui':'./libs/mui.min',
		'picker':'./libs/mui.picker',
		'poppicker':'./libs/mui.poppicker',
		'dtpicker':'./libs/mui.dtpicker',
		'echarts':'./libs/echarts.min',
		
		'dom':'./common/dom',
		'getUid':'./common/getUid',
		'format':'./common/format',
		'getParams':'./common/getParams'
	},
	shim:{
		'picker':{
			deps:['mui']
		},
		'poppicker':{
			deps:['mui']
		},
		'dtpicker':{
			deps:['mui']
		}
	}
})