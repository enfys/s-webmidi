function AudioSequencer()
{
    var _events = [],
        _playbackRate = 1,
        _playing = false,
        eventHandler = undefined,
        timeoutID = 0;
    
    ///////////////////////////////////////////////////////////////////////////
    // Properties
    
    // Sets or gets the events to play
    this.events = function(newEvents)
    {
        if (newEvents)
        {
            _events = newEvents;
            return this;
        }
        return _events;
    };
    
    // Sets or gets playback rate
    // 1 = normal, <1 = slower, >1 = faster
    this.playbackRate = function(newRate)
    {
        if (newRate)
        {
            _playbackRate = newRate;
            return this;
        }
        return _playbackRate;
    };
    
    this.isPlaying = function()
    {
        return _playing;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Playback functions
    
    this.startPlayback = function(callback, startPos)
    {
        startPos = startPos || 0;
        
        if (!_playing && _events.length > 0)
        {
            _playing = true;
            eventHandler = callback;
            playEvent(startPos);
            return true;
        }
        return false;
    };

    this.stopPlayback = function()
    {
        if (_playing)
        {
            _playing = false;
            if (timeoutID) clearTimeout(timeoutID);
            eventHandler = undefined;
        }
    };

    function playEvent(index)
    {
        var event = _events[index];
        eventHandler(event.event, event.note, index);

        // Go to next event
        index++;
        if (index < _events.length)
        {
            // Wait until next event time has elapsed to play it
            timeoutID = setTimeout(function()
            {
                playEvent(index);
            },
            _events[index].deltaTime * (1 / _playbackRate));
        }
        else _playing = false; // all done
    }
}

AudioSequencer.eventCodes =
{
    noteOn: 1,
    noteOff: 2,
    cuePoint: 3,
    endOfTrack: 4
};
