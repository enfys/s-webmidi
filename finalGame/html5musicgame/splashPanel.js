
function SplashPanel(audioManager)
{
    "use strict";
    var $div = $("#splash"),
        error = false;
        
    $(".options button", $div).click(function()
    {
        var songName = $("#select-song>option:selected", $div).val();
        var rate = Number($("#select-rate>option:selected", $div).val());
        var playGame = Boolean($(this).attr("id") == "start-game");
        app.startGame(songName, rate, playGame);
    });
    
    ///////////////////////////////////////////////////////////////////////////
    // Public methods
    
    this.show = function()
    {
        $div.fadeIn();
        return this;
    };
    
    this.hide = function()
    {
        $div.hide();
        return this;
    };
    
    // These are required by the app for all panels but we don't use them.
    this.onKeyUp = function(e){};
    this.onKeyDown = function(e){};
    
    this.loadAudio = function()
    {
        var count = 0,
            loaded = 0,
            error = false;
        
        $(".keyboard .piano-key").each(function()
        {
            count++;
            var noteName = escape($(this).data("note"));
            audioManager.getAudio(noteName,
                function()
                {
                    if (error) return;
                    if (++loaded == count) showOptions();
                    else updateProgress(loaded, count);
                },
                function(audio) { showError(audio); }
            );
        });
    };
    
    ///////////////////////////////////////////////////////////////////////////
    // Private methods
    
    function updateProgress(loadedCount, totalCount)
    {
        var pctComplete = parseInt(100 * loadedCount / totalCount);
        $("progress", $div).val(pctComplete).text(pctComplete + "%");
    }
    
    function showOptions()
    {
        $(".loading", $div).hide();
        $(".options", $div).fadeIn();
    }
    
    function showError(audio)
    {
        error = true;
        $(".loading", $div).hide();
        $(".error", $div)
            .append("<div>" + audio.src + "<div>")
            .show();
    }
}
