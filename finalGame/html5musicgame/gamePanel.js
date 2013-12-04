function GamePanel(audioManager)
{
    "use strict";
    var $panel = $("#game"),
        $notesPanel = $("#notes-panel"),
        $resultsPanel = $("#results-panel"),
        sequencer = new AudioSequencer(),
        noteCount = 0,
        notesCorrect = 0,
        score = 0,
        intervalId = 0,
        currentNote = {
            note: "",
            $note: null,
            time: 0
        },
        gracePeriod = 200,
        practiceMode = false,
        keyCodesToNotes = {},
        sustain = true,
        volume = 1.0,
        framesPerSecond = 30,
        pixelsPerFrame = 60 / framesPerSecond;
    
    $("#quit-button", $panel).click(quitGame);
    $("#stop-button", $panel).click(stopGame);
    $("#restart-button", $panel).click(restartGame);
    $("#sustain").change(function() { sustain = Boolean($(this).is(":checked")); });
    $("#volume").change(function() { volume = Number($(this).val() / 100); });
    if (!isInputTypeSupported("range")) $("#volume").css("width", "2em");
    initKeyboard();
    
    ///////////////////////////////////////////////////////////////////////////
    // Public methods
    
    this.setOptions = function(songName, rate, playGame)
    {
        sequencer.events(musicData[songName])
                 .playbackRate(rate);
        practiceMode = !playGame;
        return this;
    };
    
    this.show = function()
    {
        $panel.fadeIn(startGame);
        return this;
    };
    
    this.hide = function()
    {
        $panel.hide();
        return this;
    };
    
    this.onKeyDown = function(e)
    // 1.press any key
    {
        var note = keyCodesToNotes[e.which];
        if (note)
        {
            pressPianoKey(note);
        }
    };
    
    this.onKeyUp = function(e)
    {
        var note = keyCodesToNotes[e.which];
        if (note)
        {
            releasePianoKey(note);
        }
    };
    
    ///////////////////////////////////////////////////////////////////////////
    // Private methods
    
    function startGame()
    {
        $resultsPanel.hide();
        $notesPanel.show();
        // Reset score
        noteCount = 0;
        notesCorrect = 0;
        score = 0;
        
        // Start interval for notes animation
        intervalId = setInterval(function() { updateNotes(); }, 1000 / framesPerSecond);
        // Start playback of the song
        sequencer.startPlayback(onAudioEvent, 0);
    }
    
    function onAudioEvent(eventCode, note)
    {
        // This gets called for each event in the song data
        switch (eventCode)
        {
            case AudioSequencer.eventCodes.noteOn:
                addNote(note);
                break;
            case AudioSequencer.eventCodes.endOfTrack:
                sequencer.stopPlayback();
                break;
        }
    }
    
    function quitGame()
    {
        endGame();
        app.quitGame();
    }
    
    function endGame()
    {
        stopGame();
        // Remove any remaining notes
        $(".note", $notesPanel).remove();
    }
    
    function stopGame()
    {
        if (intervalId)
        {
            clearInterval(intervalId);
            intervalId = 0;
            sequencer.stopPlayback();
            currentNote.note = "";
            currentNote.time = 0;
        }
    }
    
    function restartGame()
    {
        endGame();
        startGame();
    }
    
    function addNote(note)
    {
        noteCount++;
        // Add a new note element
        var $note = $("<div class='note'></div>");
        $note.data("note", note);
        $notesPanel.append($note);
        
        var $key = getPianoKeyElement(note);
        // Position the note element over the piano key
        $note.css("top", "0")
             .css("left", $key.position().left)
             .css("width", $key.css("width"));
        
        if ($key.hasClass("black"))
        {
            $note.addClass("black");
        }
    }
    
    function updateNotes()
    {
        $(".note", $notesPanel).each(function()
        {
            var $note = $(this);
            var top = $note.position().top;
            if (top <= 200)
            {
                // Move the note down
                top += pixelsPerFrame;
                $note.css("top", top);
                if (top + 20 > 200)
                {
                    // The note hit the bottom of the panel
                    currentNote.note = $note.data("note");
                    currentNote.time = getCurrentTime();
                    currentNote.$note = $note;
                    if (practiceMode) pressPianoKey($note.data("note"));
                }
            }
            else
            {
                // Note is below the panel, remove it
                if (practiceMode) releasePianoKey($note.data("note"));
                $note.remove();
            }
        });

        // Check if there are any notes left
        if ($(".note", $notesPanel).length == 0)
        {
            // No more notes, game over man
            if (!practiceMode) showScore();
            endGame();
        }
    }

    function checkNote(note)
    {
        // Check if the current note is the note the user played
        if (currentNote.note == note)
        {
            // Compute the difference in time
            var dif = getCurrentTime() - currentNote.time;
            // If they are close enough give them some points
            if (dif < gracePeriod)
            {
                notesCorrect++;
                score += Math.round(10 * (gracePeriod - dif) / gracePeriod); // Max 10 points for accuracy
                currentNote.$note.css("background", "green");
                addHitEffect();
            }
        }
    }

    function addHitEffect()
    {
        // Flash the title in the background
        var $title = $(".title", $notesPanel);
        $title.css("color", "#012");
        setTimeout(function() { $title.css("color", "black"); }, 100);
    }
    
    function getCurrentTime()
    {
        return new Date().getTime();
    }
    
    function showScore()
    {
        $notesPanel.hide();
        $resultsPanel.fadeIn();
        $(".score", $resultsPanel).text(score);
        $(".correct", $resultsPanel).text(notesCorrect);
        $(".count", $resultsPanel).text(noteCount);
        $(".note-accuracy", $resultsPanel).text(Math.round(100 * notesCorrect / noteCount));
        $(".timing-accuracy", $resultsPanel).text(Math.round(10 * score / notesCorrect));
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Methods for the keyboard
    
    function initKeyboard()
    {
        var $keys = $(".keyboard .piano-key");
        if ($.isTouchSupported)
        {
            $keys.touchstart(function(e) {
                e.stopPropagation();
                e.preventDefault();
                keyDown($(this));
            })
            .touchend(function() { keyUp($(this)); })
        }
        else
        {
            $keys.mousedown(function() {
                keyDown($(this));
                return false;
            })
            .mouseup(function() { keyUp($(this)); })
            .mouseleave(function() { keyUp($(this)); });
        }

        // Create mapping of key codes to notes
        $keys.each(function() {
            var $key = $(this);
            var keyCode = keyCodes[$key.data("keycode")]; //2.get each keycode of each key   
            keyCodesToNotes[keyCode] = $key.data("note");
        });
    }
    
    function keyDown($key)
    {
        // Make sure it's not already pressed
        if (!$key.hasClass("down"))
        {
            $key.addClass("down");
            var noteName = $key.data("note");
            var audio = audioManager.getAudio(escape(noteName));
            audio.currentTime = 0;
            audio.volume = volume;
            audio.play();
            checkNote(noteName);
        }
    }
    
    function keyUp($key)
    {
        $key.removeClass("down");
        if (!sustain)
        {
            var noteName = $key.data("note");
            var audio = audioManager.getAudio(escape(noteName));
            audio.pause();
        }
    }

    function pressPianoKey(note)
    {
        var $key = getPianoKeyElement(note);
        keyDown($key);
    }
    
    function releasePianoKey(note)
    {
        var $key = getPianoKeyElement(note);
        keyUp($key);
    }

    function getPianoKeyElement(note)
    {
        return $(".keyboard .piano-key[data-note=" + note + "]");
    }

    function isInputTypeSupported(type)
    {
        var $test = $("<input>");
        // Set input element to the type we're testing for
        $test.attr("type", type);
        return ($test[0].type == type);
    }
}