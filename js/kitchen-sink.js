var myApp = new Framework7({
    onBeforePageInit: function (page) {
        // Do something when page just added to DOM
    },
    onPageInit: function (page) {
        // Do something on page init
    },
    onPageAfterAnimation: function (page) {
        // Do something on page before animation start
        // console.log(page);
    },
    onPageBeforeAnimation: function (page) {
        // Do something on page ready(centered)
        // console.log(page);
    }
});

// Expose Internal DOM library
var $$ = myApp.$;
var ws, name, client_list={};

function connect() {
   ws = new WebSocket("ws://chat.workerman.net:7272");
   ws.onopen = onopen;
   ws.onmessage = onmessage; 
   ws.onclose = function() {connect();};
   ws.onerror = function() {console.log("error");};
}

function onopen(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    window.localStorage.setItem('pid',uuid);
    room_id = window.location.search.substring(1);
    var login_data = '{"type":"login","client_name":"'+uuid+'","room_id":"'+room_id+'"}';
    ws.send(login_data);
}


function onmessage(e){
    var pid = window.localStorage.getItem('pid');
    console.log('on message',pid)
    var data = JSON.parse(e.data);
    console.log('from client name',data['from_client_name']);
    if(data['from_client_name'] === pid){
        return;
    }
    switch(data['type']){
        case 'ping':
            ws.send('{"type":"pong"}');break;
        case 'say':
                myApp.addMessage({
                    text: data['content'],
                    type: 'received'
                });break;
    }
}

window.onload = function(){
 connect();
}
// Add main view
var mainView = myApp.addView('.view-main', {
    // Enable Dynamic Navbar for this view
    dynamicNavbar: true
});
// Add another view, which is in right panel

// Events for specific pages when it initialized
$$(document).on('pageInit', function (e) {
    var page = e.detail.page;
    // Handle Modals Page event when it is init
    // Action sheet, we use it on two pages
    //Messages page
    if (page.name === 'messages') {
        var conversationStarted = false;
        var answers = [
            'Yes!',
            'No',
            'Hm...',
            'I am not sure',
            'And what about you?',
            'May be ;)',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed luctus tincidunt erat, a convallis leo rhoncus vitae.'
        ];
        var answerTimeout;
        $$('.ks-messages-form').on('submit', function (e) {
            e.preventDefault();
            var input = $$(this).find('.ks-messages-input');
            var messageText = input.val();
            if (messageText.length === 0) return;
            // Empty input
            ws.send('{"type":"say","to_client_id":"all","content":"'+messageText+'"}');
            input.val('');
            // Add Message
            myApp.addMessage({
                text: messageText,
                type: 'sent',
                day: !conversationStarted ? 'Today' : false,
                time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
            });
            conversationStarted = true;
            // Add answer after timeout
            /*
            if (answerTimeout) clearTimeout(answerTimeout);
            answerTimeout = setTimeout(function () {
                myApp.addMessage({
                    text: answers[Math.floor(Math.random() * answers.length)],
                    type: 'received'
                });
            }, 2000);
            */
        });
        $$('.ks-send-message').tap(function () {
            $$('.ks-messages-form').trigger('submit');
        });
    }


});

