/**
 * This file contains audio related logic to control sounds.
 */

/**
 * Audio module.
 */
var Audio = {
	audioTags: [
		document.getElementById('sound1'),
		document.getElementById('sound2'),
		document.getElementById('sound3'),
	],

	dynamicTag: document.getElementById('dynamicSound'),

	/**
	 * Play a sound using a predefined audio tag.
	 * 
	 * @param  {Number} index  	The audio tag index.
	 * @param  {Number} volume 	The volume from 0 to 1.
	 */
	play: function (track, volume){
		if (typeof track === 'undefined'){
			console.error('Bad track: Tried to play a missing sound');
		}

		var tag = this.audioTags[track];
		if (volume) tag.volume = volume;
		tag.play();
	},

	playSrc: function (src, volume){
		this.dynamicTag.src = src;
		if (volume) this.dynamicTag.volume = volume;
		this.dynamicTag.oncanplay = function (){
			this.play();
		};
	}
};
