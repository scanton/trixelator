(function() {
	var componentName = 'modal-dialog-view';
	var s = `
		<div :class="isVisible ? '' : 'hidden'" class="` + componentName + ` modal-view">
			<div class="dialog">
				<h2>{{title}}</h2>
				<form>
					<div class="dialog-body" v-html="body"></div>
					<div @click="handleClick" class="dialog-buttons pull-right" v-html="buttons"></div>
				</form>
				<div class="clear"></div>
			</div>
		</div>
	`;
	
	Vue.component(componentName, {
		created: function() {
			
		},
		computed: {
			body: function() {
				return store.state.modalDialogBody;
			},
			buttons: function() {
				var buttons = store.state.modalDialogButtons;
				var s = '';
				var l = buttons.length;
				var b;
				for(var i = 0; i < l; i++) {
					b = buttons[i];
					s += '<button data-button-index="' + i + '" class="' + b.class + '">' + b.label + '</button>';
				}
				return s;
			},
			isVisible: function() {
				return store.state.isModalDialogVisible;
			},
			title: function() {
				return store.state.modalDialogTitle;
			}
		},
		props: [],
		template: s,
		data: function() {
			return {
			}
		},
		methods: {
			handleClick: function(e) {
				e.preventDefault();
				var index = e.target.getAttribute("data-button-index");
				if(index && store.state.modalDialogButtons[index] && store.state.modalDialogButtons[index].handler) {
					store.state.modalDialogButtons[index].handler(e);
				}
			}
		}
	});
})();
