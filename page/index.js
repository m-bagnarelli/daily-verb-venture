import getRandomInt from '../utils/get-random-int.js';
import capitalizeStr from '../utils/capitalize-str.js';
import isSameDay from '../utils/is-same-day.js';

const speakButton = document.getElementById('speakButton');
const favoriteButton = document.getElementById('favoriteButton');
const contentCopyButton = document.getElementById('contentCopyButton');

const actionLabelElement = document.getElementById('action-label');
const favoriteIconElement = document.getElementById('favoriteIcon');
const notificationContainerElement = document.getElementById('notification-container');
const notificationElement = document.getElementById('notification');

// Init Function 
const init = async () => {
	const dailyVerbInStorage = getDailyVerbInStorage();
	const dailyVerbExpired = verbInStorageHasExpired(dailyVerbInStorage);

	if (dailyVerbInStorage && !dailyVerbExpired) {
		displayVerb(dailyVerbInStorage);
		const isFavorite = isDailyVerbFavorite(dailyVerbInStorage);
		if (isFavorite) {
			favoriteIconElement.classList.add('filled');
		}
	} else {
		const verbs = await fetchVerbs();
		const dailyVerb = getRandomVerb(verbs);
		setDailyVerbInStorage(dailyVerb);
		displayVerb(dailyVerb);
	}
}

// Favorite Button Click Listener
favoriteButton.addEventListener('click', () => {
	const dailyVerbInStorage = getDailyVerbInStorage();
	const isFavorite = isDailyVerbFavorite(dailyVerbInStorage);

	if (isFavorite) {
		dailyVerbInStorage.favorite = false;
		favoriteIconElement.classList.remove('filled');
		showNotification('Phrasal verb removed from favorites!');
	} else {
		dailyVerbInStorage.favorite = true;
		favoriteIconElement.classList.add('filled');
		showNotification('Phrasal verb added to favorites!');
	}
	// Update favorite property in storage.
	setDailyVerbInStorage(dailyVerbInStorage);
});

// CopyToClipboard Button Click Listener
contentCopyButton.addEventListener('click', () => {
	const { verb } = getDailyVerbInStorage();
	navigator.clipboard.writeText(verb);
	showNotification('Phrasal verb copied to Clipboard!');
});

speakButton.addEventListener('click', () => {
	if ('speechSynthesis' in window) {
		const { example } = getDailyVerbInStorage();
		const voiceMessage = new SpeechSynthesisUtterance(example);
		window.speechSynthesis.speak(voiceMessage);
	} else {
		alert('Your browser does not support Web Speech API.');
	}
});

// Action Buttons Hover Listeners: 
speakButton.addEventListener('mouseenter', () => {
	actionLabelElement.innerHTML = 'Listen up!';
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
	notificationContainerElement.classList.remove('fadeOut');
	notificationContainerElement.classList.add('fadeIn');

	setTimeout(() => {
		notificationContainerElement.classList.remove('fadeIn');
		notificationContainerElement.classList.add('fadeOut');
	}, 1500);
}

const isDailyVerbFavorite = (verb) => {
	return verb?.hasOwnProperty('favorite') && verb?.favorite;
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

const fetchVerbs = async () => {
	const response = await fetch('../data/phrasal-verbs.json');
	const data = await response.json();
	return data['phrasal_verbs'];
}

const getRandomVerb = (verbs) => {
	const length = verbs.length;
	const randomIndex = getRandomInt(0, length - 1);
	return verbs[randomIndex];
}

const displayVerb = ({ verb, meaning_en, pronunciation, example }) => {
	const capitalizedVerb = capitalizeStr(verb);
	document.getElementById('verb').innerHTML = `${capitalizedVerb}`;
	document.getElementById('pronunciation').innerHTML = `(/${pronunciation}/)`;
	document.getElementById('meaning_en').innerHTML = meaning_en;
	document.getElementById('example').innerHTML += example;
}

init();