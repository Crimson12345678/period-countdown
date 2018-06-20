"use strict";

class BellTimer {

	constructor() {
		this.calendar = {};
		this.schedule = [];
		this.offset = 0;
	}

	calculateOffset(numOfRequests) {

		if (!numOfRequests) throw "Missing arguments";

		var offsets = [];

		for (let i = 0; i < numOfRequests; i++) {

			setTimeout(() => {

				RequestManager.getTime().then(time => {

					offsets.push(time - Date.now());

					let temp = 0;
					for (let i = 0; i < offsets.length; i++) temp += offsets[i];


					this.offset = temp / offsets.length;
					/*console.log(this.offset);
					console.log(offsets);*/

				});

			}, 1000 * i);
		}

	}

	parseCalendar(calendar) {
		for (let i = 0; i < calendar.length; i++) {
			let cache = calendar[i];
			if (cache.date) {

			} else if (cache.to && cache.from) {
				
			}
		}
	}

	getCurrentTime() { return this.offset + Date.now(); }

	getDateStringFromDateObject(dateObject) {
		return (dateObject.getMonth() + 1) + '/' + dateObject.getDate() + '/' + dateObject.getFullYear();
	}

	getDateObjectFromDateString(dateString) {
		var a = dateString.split('/');
		return new Date(a[2], (parseInt(a[0]) - 1), a[1], 0, 0, 0, 0);
	}

}
