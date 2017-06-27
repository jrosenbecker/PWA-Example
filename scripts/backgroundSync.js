import $ from 'jquery';
import idbKeyval from 'idb-keyval';

$(window.document).ready(() => {
    var syncButton = $('#sync-button');

    if(syncButton) {
        syncButton.click(event => {
            event.preventDefault();

            // Get the user input value from the message text box
            var message = $('#message').val();
            var messageObject = { message: message };
            
            // Put the value into indexedDB
            idbKeyval.set('message', messageObject)
            .then(() => {
                // Once the value has been stored, check to see if syncing &
                // service workers are supported
                if('serviceWorker' in navigator && 'SyncManager' in window) {
                    
                    // If supported, then register a sync event
                    return navigator.serviceWorker.ready.then(sw => {
                        return sw.sync.register('message-sync');

                    }).catch(err => {

                        // If the registration fails (potentially due to OS level restrictions)
                        // then attempt the post normally
                        return postMessage(messageObject);
                    });
                } else {
                    
                    // post the message normally if service workers and syncing are not supported
                    return postMessage(messageObject);
                }
            }).then(() => {
                $('#message').val('');
            })
        });
    }

    function postMessage(messageObject) {
        return $.ajax({
            type: 'POST',
            url: '/post-message',
            data: JSON.stringify(messageObject),
            contentType: 'application/json',
            success: (success) => {
                idbKeyval.delete('message').then(() => {
                    console.log('Deleted message from idb-keyval');
                });
            }
        }).fail(err => {
            console.error(error);
        })
    }
});