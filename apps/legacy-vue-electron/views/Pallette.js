(function() {
	var componentName = 'pallette';
	var s = `
		<div class="` + componentName + `">
			<div class="pallette-swatch" v-for="color in colorList" :style="'background: ' + color.color "></div>
		</div>
	`;
	
	Vue.component(componentName, {
		created: function() {
			
		},
		computed: {
			colorList: function() {
				var list = stripObservers(store.state.colorList);
				list.sort((a, b) => {
					let al = Math.floor(a.luminance * 10);
					let ah = a.hue;
					let bl = Math.floor(b.luminance * 10);
					let bh = b.hue
					if((ah + al) > (bh + bl)) {
						return -1;
					} else if((ah + al) < (bh + bl)) {
						return 1;
					}
					return 0;
				});
				return list;
			}
		},
		props: [],
		template: s,
		data: function() {
			return {}
		},
		methods: {
			
		}
	});
})();
