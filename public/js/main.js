// instatiate classes
var bellTimer, elements = new Elements(), analytics = new Analytics, prefManager = new PrefManager;


var render = {
	index: () => {
		console.time('index');

		elements.switchTo('index');

		let firstRun = true;
		var mainLoop = () => {

			if (window.location.pathname === '/') {

				let time = bellTimer.getRemainingTime();

				time.period_name = prefManager.getPeriodName(time.period) || time.period;

				elements.updateScreen(time);

				if (firstRun) {
					analytics.setPeriod(time.period);
					analytics.setPeriodName(time.period_name)
					firstRun = false;
				}

			}

			setTimeout(mainLoop, 50);
		}

		if (!bellTimer) {
			// startup the actually timer; only happens when u actually go to the index page
			Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
				let [presets, calendar] = values;

				bellTimer = new BellTimer(presets, calendar);
				
				elements.updateElementsWithPreferences(prefManager.getAllPreferences()); // before first paint
				mainLoop();
				elements.updateScreenFontSize();
				//elements.hidePreloader();
			
				console.timeEnd('index');

			}).catch(err => {
				//elements.showErrorScreen();
				RequestManager.sendError({
					where: 'browser',
					type: 'client_page_load',
					description: err.stack
				});
			});

			window.onresize = () => {
				elements.updateScreenFontSize();
				elements.dimensionCanvas();
			}
		} else
			console.timeEnd('index');
	},
	settings: () => {

		console.time('settings');

		document.title = 'Settings - Bell Countdown';
		elements.switchTo('settings');

		console.timeEnd('settings');
	},
	notFound: () => {
		console.time('notFound');

		document.title = 'Not Found - Bell Countdown';
		elements.switchTo('not-found');

		console.timeEnd('notFound');
	}
}

var load = (path, shouldPushHistory = false) => {

	if (shouldPushHistory) window.history.pushState({}, '', path);

	if (path === '/')
		render.index();
	else if (path === '/settings')
		render.settings();
	else
		render.notFound();
}






// inital page render
load(window.location.pathname, false);

RequestManager.init().then(data => {

	if (data.email) {
		prefManager.setGoogleAccount(data);
		elements.updateElementsWithPreferences(prefManager.getAllPreferences());
		analytics.setRegisteredTo(data.email);
	}

	if (window.localStorage.device_id) {
		analytics.setDeviceId(window.localStorage.device_id);
		analytics.setTheme(prefManager.getThemeName());
	} else
		throw "Device id was not established";

	console.log(data);

}).catch(err => {
	RequestManager.sendError({
		where: 'browser',
		type: 'client_page_load',
		description: err.stack
	});
});

// makes sure that back and forwards buttons work
window.onpopstate = () => {
	load(window.location.pathname, false);
}

// sends analytics
analytics.setPathname(window.location.pathname);






// has to be global for google
var googleApiDidLoad = () => {

	gapi.load('auth2', () => {
		gapi.auth2.init({
			client_id: '989074405041-k1nns8p3h7eb1s7c6e3j6ui5ohcovjso.apps.googleusercontent.com',
			cookiepolicy: 'single_host_origin',
			scope: 'profile email'
		}).then(GoogleAuth => {
			return GoogleAuth.signIn({
				scope: 'profile email'
			});
		}).then(data => {
			let account = {
				email: data.w3.U3,
				first_name: data.w3.ofa,
				last_name: data.w3.wea,
				profile_pic: data.w3.Paa
			}
			prefManager.setGoogleAccount(account);
			return RequestManager.login(account);
		}).then(data => {
			if (data.status) {
				elements.updateElementsWithPreferences(prefManager.getAllPreferences());
			} else {
				window.alert('Our servers are having a bad day. Please try again another time.');
			}
		}).catch(e => {
			if (e.error === 'popup_blocked_by_browser') {
				window.alert('It looks like your browser blocked Google from displaying their sign in screen. Please allow pop-ups and try again.')
			}
		});
	});

}