/**
* The audio manager provides support for loading audio files.
* @param audioPath The default path to look for audio files
*/
function AudioManager(audioPath)
{
    audioPath = audioPath || "";
    var audios = {},
        audioExt = getSupportedFileTypeExt();

    this.getAudio = function(name, onLoaded, onError)
    {
        var audio = audios[name];
        if (!audio)
        {
            audio = createAudio(name, onLoaded, onError);
            // Add to cache
            audios[name] = audio;
        }
        else if (onLoaded)
        {
            onLoaded(audio);
        }
        return audio;
    };

    function createAudio(name, onLoaded, onError)
    {
        console.log("Loading audio: " + name);
        var audio = $("<audio>")[0];
        audio.addEventListener("canplaythrough", function()
        {
            console.log("Audio loaded: " + name);
            if (onLoaded) onLoaded(audio);
            // In firefox we keep getting these events if it's not removed
            audio.removeEventListener("canplaythrough", arguments.callee);
        });
        audio.onerror = function()
        {
            console.log("Error loading audio: " + audio.src);
            if (onError) onError(audio);
        };
        audio.src = audioPath + "/" + name + audioExt;
        return audio;
    }

    function getSupportedFileTypeExt()
    {
        var audio = $("<audio>")[0];
        if (audio.canPlayType("audio/ogg")) return ".ogg";
        if (audio.canPlayType("audio/mpeg")) return ".mp3";
        if (audio.canPlayType("audio/wav")) return ".wav";
        return "";
    };
    
    this.each = function(callback)
    {
        for (var i in audios)
        {
            callback(audios[i]);
        }
    };
}