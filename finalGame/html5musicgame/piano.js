"use strict";

function PianoHeroApp()
{
    var   audioManager = new AudioManager("audio"),
        splashPanel = new SplashPanel(audioManager),
        gamePanel = new GamePanel(audioManager),
        curPanel = undefined;
    
    function showPanel(panel)
    {
        if (curPanel) curPanel.hide();
        curPanel = panel;
        curPanel.show();
    }
    
    this.startGame = function(songName, rate, playGame)
    {
        gamePanel.setOptions(songName, rate, playGame);
        showPanel(gamePanel);
    };
    
    this.quitGame = function()
    {
        showPanel(splashPanel);
    };
    
    this.start = function()
    {
        $(document).keydown(function(e) { curPanel.onKeyDown(e); })
                   .keyup(function(e) { curPanel.onKeyUp(e); });
                   
        showPanel(splashPanel);
        splashPanel.loadAudio();
    };
}

$(function()
{
    window.app = new PianoHeroApp();
    window.app.start();
});