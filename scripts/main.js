let panels = function () {
	let assign = function (obj, elems) {
		elems.each((i, elem) => obj[ $(elem).data('panel') ] = $(elem));
		return obj;
	};

	let triggers = assign({}, $('.triggers .trigger'));
	let buttons = assign({}, $('.panel .buttons .close'));
	let pois = $('.poi');
	let panels = assign({}, $('.panel'));
	let state = $();

	let dur = 220;
	let check = () => {
		triggers.tags.toggleClass('selected', panels.tags.is(':visible'));
		triggers.list.toggleClass('selected', panels.list.is(':visible'));
	};

	triggers.tags.add(triggers.list).on('click', event => {
		if (panels.detail.is(':visible'))
			panels.detail.slideUp(dur);
		($(event.target).is(triggers.tags) ? panels.tags : panels.list).slideToggle(dur, check);
	});

	pois.on('click', event => {
		if (panels.detail.is(':visible'))
			return;
		state = panels.tags.add(panels.list).filter(':visible').slideUp(dur, check);
		panels.detail.slideDown(dur);
	});

	buttons.tags.add(buttons.list).on('click', event => {
		$(event.target).closest(panels.tags.add(panels.list)).slideUp(dur, check);
	});

	buttons.detail.on('click', () => {
		panels.detail.slideUp(dur);
		state.slideDown(dur, check);
	});
};

let tags = function () {
	let triggers = $('.panel.tags .tag');
	let states = triggers.map((i, tag) => $(tag).data('tag')).toArray().reduce((obj, tag) => { obj[tag] = true; return obj; }, {});
	let pois = $('.poi');

	triggers.on('click', event => {
		let trigger = $(event.target);
		let tag = trigger.data('tag');

		switch (event.originalEvent.detail) {
			case 2:
				let mode = Object.values(states).filter(value => value).length <= 1;
				for (let tag in states)
					states[tag] = mode;
				states[tag] = true;
				triggers.toggleClass('disabled', !mode).filter(trigger).removeClass('disabled');
				break;
			default:
				trigger.toggleClass('disabled');
				states[tag] = !states[tag];
		}

		pois.attr({ 'data-inactive': 1 }).hide();
		pois.filter((i, item) => {
			let tag = $(item).data('tags').split(' ').find(tag => states[tag]);
			$(item).attr({ 'class': `poi ${ tag }` });
			return tag;
		}).removeAttr('data-inactive').show();
	});
};

let detail = function () {
	let triggers = {
		map: $('.map .poi'),
		list: $('.list .poi')
	}
	let panel = $('.panel.detail');
	let nav = {
		prev: panel.find('.prev'),
		next: panel.find('.next')
	};
	let id;

	let next = (id, direction) => triggers.list.filter(`[data-poi=${ id }]`)[ ['prevAll', 'nextAll'][direction] ](':not([data-inactive])');
	let check = id => {
		nav.prev.toggleClass('disabled', next(id, 0).length == 0);
		nav.next.toggleClass('disabled', next(id, 1).length == 0);
	};

	triggers.map.add(triggers.list).on('click', event => {
		id = $(event.target).closest(triggers.map.add(triggers.list)).data('poi');
		panel.find('h3').text( data[id].title );
		panel.find('img').attr({ src: `/data/images/${ data[id].images[0] }` });
		panel.find('p').text( data[id].description );
		check(id);
	});

	nav.prev.add(nav.next).on('click', event => {
		let button = $(event.target);
		if (button.is('.disabled'))
			return;

		let poi = next(id, button.is(nav.prev) ? 0 : 1).first().trigger('click');
		check(poi.data('poi'));
	});
};

$(window).on('load', () => {
	panels();
	tags();
	detail();
});
