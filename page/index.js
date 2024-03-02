import getRandomInt from '../utils/get-random-int.js';
import capitalizeStr from '../utils/capitalize-str.js';
import isSameDay from '../utils/is-same-day.js';

const actionButtons = document.querySelectorAll('.action-btn');

const speakButton = document.getElementById('speakButton');
const favoriteButton = document.getElementById('favoriteButton');
const contentCopyButton = document.getElementById('contentCopyButton');

const actionLabelElement = document.getElementById('action-label');
const notificationElement = document.getElementById('notification');

actionButtons.forEach(button => {
	button.addEventListener('click', () => {
		if (button.id === 'speakButton') {
			return ;
		} else if (button.id === 'favoriteButton') {
			handleFavorites();
		} else {
			// contentCopyButton
			const { verb } = getDailyVerbInStorage();
			navigator.clipboard.writeText(verb);
			notificationElement.innerHTML = 'Phrasal verb copied to Clipboard ✨';
		}

		setTimeout(() => {
			notificationElement.innerHTML = '';
		}, 1000);
	});
});

const handleFavorites = () => {
	const dailyVerbInStorage = getDailyVerbInStorage();
	if (dailyVerbInStorage.hasOwnProperty('favorite') && dailyVerbInStorage.favorite) {
		dailyVerbInStorage.favorite = false;
		setDailyVerbInStorage(dailyVerbInStorage);
		document.getElementById('favoriteIcon').classList.remove('filled');
		notificationElement.innerHTML = 'Phrasal verb removed from Favorites ✨';
	} else {
		dailyVerbInStorage.favorite = true;
		setDailyVerbInStorage(dailyVerbInStorage);
		document.getElementById('favoriteIcon').classList.add('filled');
		notificationElement.innerHTML = 'Phrasal verb added to Favorites ✨';
	}
}

speakButton.addEventListener('click', () => {
	if ('speechSynthesis' in window) {
		const { example } = getDailyVerbInStorage();
		const voiceMessage = new SpeechSynthesisUtterance(example);
		window.speechSynthesis.speak(voiceMessage);
	} else {
		alert('Your browser does not support Web Speech API.');
	}
});

speakButton.addEventListener('mouseenter', () => {
	actionLabelElement.innerHTML = 'Listen up!';
});

speakButton.addEventListener('mouseleave', () => {
	actionLabelElement.innerHTML = '';
});

favoriteButton.addEventListener('mouseenter', () => {
	actionLabelElement.innerHTML = 'Add to Favorites';
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

const init = async () => {
	const dailyVerbInStorage = getDailyVerbInStorage();
	const hasDailyVerbExpired = verbInStorageHasExpired(dailyVerbInStorage);
	if (dailyVerbInStorage && !hasDailyVerbExpired) {
		displayVerb(dailyVerbInStorage);
	} else {
		const verbs = await fetchVerbs();
		const dailyVerb = getRandomVerb(verbs);
		setDailyVerbInStorage(dailyVerb);
		displayVerb(dailyVerb);
	}
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