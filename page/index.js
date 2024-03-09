import PHRASAL_VERBS from '../data/phrasal-verbs.js';
import getRandomInt from '../utils/get-random-int.js';
import capitalizeStr from '../utils/capitalize-str.js';
import isSameDay from '../utils/is-same-day.js';

let currentVerbDisplayed;

const speakButton = document.getElementById('speakButton');
const favoriteButton = document.getElementById('favoriteButton');
const contentCopyButton = document.getElementById('contentCopyButton');

const actionLabelElement = document.getElementById('action-label');
const favoriteIconElement = document.getElementById('favoriteIcon');
const notificationContainerElement = document.getElementById('notification-container');
const notificationElement = document.getElementById('notification');

const favoriteListElement = document.getElementById('favorites-list');
const showFavoritesElement = document.getElementById('show-favorites');
const hideFavoritesElement = document.getElementById('hide-favorites');

// Init Function 
const init = () => {
	const dailyVerbInStorage = getDailyVerbInStorage();
	const dailyVerbExpired = verbInStorageHasExpired(dailyVerbInStorage);

	if (dailyVerbInStorage && !dailyVerbExpired) {
		setBackgroundImage();
		displayVerb(dailyVerbInStorage);
		const isFavorite = isDailyVerbFavorite(dailyVerbInStorage);
		if (isFavorite) {
			favoriteIconElement.innerHTML = 'favorite';
		}
	} else {
		const verbs = PHRASAL_VERBS['phrasal_verbs'];
		const dailyVerb = getRandomVerb(verbs);
		const backgroundImageId = getRandomInt(1, 6);
		const dailyVerbToStorage = { ...dailyVerb, backgroundImageId };
		setDailyVerbInStorage(dailyVerbToStorage);
		setBackgroundImage();
		displayVerb(dailyVerb);
	}
}

// Favorite Button Click Listener
favoriteButton.addEventListener('click', () => {
	const isFavorite = isDailyVerbFavorite(currentVerbDisplayed);

	if (isFavorite) {
		removeVerbFromFavorites(currentVerbDisplayed.id);
		favoriteIconElement.innerHTML = 'favorite_border';
		showNotification('Phrasal verb removed from favorites!');
	} else {
		addVerbToFavorites(currentVerbDisplayed);
		favoriteIconElement.innerHTML = 'favorite';
		showNotification('Phrasal verb added to favorites!');
	}
	// Update favorite List.
	const favorites = getFavorites();
	displayFavoriteList(favorites);
});

// CopyToClipboard Button Click Listener
contentCopyButton.addEventListener('click', () => {
	const { verb } = currentVerbDisplayed;
	navigator.clipboard.writeText(verb);
	showNotification('Phrasal verb copied to Clipboard!');
});

speakButton.addEventListener('click', () => {
	if ('speechSynthesis' in window) {
		const { example } = currentVerbDisplayed;
		const voiceMessage = new SpeechSynthesisUtterance(example);
		window.speechSynthesis.speak(voiceMessage);
	} else {
		showNotification('Your browser does not support Web Speech API.');
	}
});

// Action Buttons Hover Listeners: 
speakButton.addEventListener('mouseenter', () => {
	actionLabelElement.innerHTML = 'Listen up';
});

speakButton.addEventListener('mouseleave', () => {
	actionLabelElement.innerHTML = '';
});

favoriteButton.addEventListener('mouseenter', () => {
	const dailyVerb = getDailyVerbInStorage();
	const isFavorite = isDailyVerbFavorite(dailyVerb);
	if (isFavorite) {
		actionLabelElement.innerHTML = 'Remove from Favorites';
	} else {
		actionLabelElement.innerHTML = 'Add to Favorites';
	}
});

favoriteButton.addEventListener('mouseleave', () => {
	actionLabelElement.innerHTML = '';
});

contentCopyButton.addEventListener('mouseenter', () => {
	actionLabelElement.innerHTML = 'Copy to Clipboard';
});

contentCopyButton.addEventListener('mouseleave', () => {
	actionLabelElement.innerHTML = '';
});

// Show Notification
const showNotification = (text) => {
	notificationElement.innerHTML = text;
	notificationContainerElement.classList.add('show');

	setTimeout(() => {
		notificationContainerElement.classList.remove('show');
	}, 1200);
}

const addVerbToFavorites = (verb) => {
	const favorites = getFavorites();
	favorites.push(verb);
	localStorage.setItem('favorites', JSON.stringify(favorites));
}

const removeVerbFromFavorites = (verbId) => {
	let favorites = getFavorites();
	favorites = favorites.filter(favorite => favorite.id !== verbId);
	localStorage.setItem('favorites', JSON.stringify(favorites));
}

const isDailyVerbFavorite = (verb) => {
	const favorites = JSON.parse(localStorage.getItem('favorites'));
	return favorites?.find(favorite => favorite.id === verb.id);
}

const getDailyVerbInStorage = () => {
	const savedDailyWord = localStorage.getItem('dailyVerb');
	return JSON.parse(savedDailyWord);
}

const setDailyVerbInStorage = (verb) => {
	const timestamp = new Date();
	const verbToStore = {  ...verb, timestamp };
	localStorage.setItem('dailyVerb', JSON.stringify(verbToStore));
}

const verbInStorageHasExpired = (verb) => {
	if (!verb?.timestamp) return ;
	const currentDate = new Date();
	const timestampDate = new Date(verb.timestamp);
	return !isSameDay(timestampDate, currentDate);
}

const getRandomVerb = (verbs) => {
	const length = verbs.length;
	const randomIndex = getRandomInt(0, length - 1);
	return verbs[randomIndex];
}

const displayVerb = (verb) => {
	const { verb: text, pronunciation, meaning_en, example } = verb;
	const capitalizedVerb = capitalizeStr(text);
	document.getElementById('verb').innerHTML = `${capitalizedVerb}`;
	document.getElementById('pronunciation').innerHTML = `(/${pronunciation}/)`;
	document.getElementById('meaning_en').innerHTML = meaning_en;
	document.getElementById('example').innerHTML = example;
	currentVerbDisplayed = verb;
}

const setBackgroundImage = () => {
	const { backgroundImageId } = getDailyVerbInStorage();
	document.body.style.backgroundImage = `url('../images/background-${backgroundImageId}.png')`;
}

const getFavorites = () => {
	return JSON.parse(localStorage.getItem('favorites')) || [];
}

// Show Favorites Listener
showFavoritesElement.addEventListener('click', () => {
	const favorites = getFavorites();
	if (favorites?.length === 0) {
		showNotification('You have no favorite verbs saved!')
	} else {
		showFavoritesElement.hidden = true;
		hideFavoritesElement.hidden = false;
		displayFavoriteList(favorites);
		favoriteListElement.style.opacity = 1;
	}
});

// Hide Favorites Listener
hideFavoritesElement.addEventListener('click', () => {
	showFavoritesElement.hidden = false;
	hideFavoritesElement.hidden = true;
	favoriteListElement.style.opacity = 0;
});

const displayFavoriteList = (favorites) => {

	favoriteListElement.innerHTML = '';
	favorites.forEach(({ verb, id }) => {
			const listItem = document.createElement('li');

			const textSpan = document.createElement('span');
			textSpan.classList.add('favorite-item-text');
			textSpan.id = `favorite-text-${id}`;
			textSpan.textContent = verb;

			const actionDiv = document.createElement('div');
			actionDiv.classList.add('footer-actions');

			const deleteSpan = document.createElement('span');
			deleteSpan.classList.add('material-icons-outlined', 'delete-favorite');
			deleteSpan.id = `delete-favorite-icon-${id}`;
			deleteSpan.textContent = 'delete';

			actionDiv.appendChild(deleteSpan);

			listItem.appendChild(textSpan);
			listItem.appendChild(actionDiv);

			favoriteListElement.appendChild(listItem);
			listenToDeleteFavoriteButton(id);
			listenToFavoriteVerbText(id);
	});
};

const listenToDeleteFavoriteButton = (verbId) => {
	const deleteIconButtonElement = document.getElementById(`delete-favorite-icon-${verbId}`);
	deleteIconButtonElement.addEventListener('click', () => {
		removeVerbFromFavorites(verbId);
		const dailyVerb = getDailyVerbInStorage();
		if (verbId === dailyVerb.id) {
			favoriteIconElement.innerHTML = 'favorite_border';
		}
		const favorites = getFavorites();
		displayFavoriteList(favorites);
		if (favorites.length === 0) {
			showFavoritesElement.hidden = false;
			hideFavoritesElement.hidden = true;
			favoriteListElement.style.opacity = 0;
		}
	});
};

const listenToFavoriteVerbText = (verbId) => {
	const favoriteVerbElement = document.getElementById(`favorite-text-${verbId}`);
	favoriteVerbElement.addEventListener('click', () => {
		const favorites = getFavorites();
		const verbToDisplay = favorites.find(favorite => favorite.id === verbId);
		displayVerb(verbToDisplay);
	});
}

init();