/**
 * LPG — photo intake
 *
 * A Google Apps Script web app. Deployed as "execute as me", so every file the
 * school uploads lands in OUR Drive: they need no Google account, there is no
 * server to run, and nothing is emailed around as attachments.
 *
 * The point is not just collecting files. Each upload is filed against a named
 * slot on the website, so what arrives is already sorted into what it is for.
 * An untagged pile of 200 photographs is not content; it is homework.
 */

// Everything lands under this one folder. Created on first run.
var ROOT_FOLDER_NAME = 'LPG website uploads';

// The shot list. These are the eleven empty photo slots on the LPG site, in the
// order a visitor meets them. Keep the ids stable: they become folder names.
var SLOTS = [
  { id: 'children-at-work',   page: 'Home',        title: 'Children at work',
    brief: 'A wide shot of a full classroom mid-lesson — children busy, teacher among them, not posed to camera.' },
  { id: 'circle-time',        page: 'A Day',       title: 'Circle time',
    brief: 'The whole class sitting together at the start of the day. The single most recognisable LPG image.' },
  { id: 'interactive-board',  page: 'A Day',       title: 'At the interactive board',
    brief: 'A child at the board working a problem, teacher seated to one side.' },
  { id: 'lego-creativity',    page: 'A Day',       title: 'Lego creativity',
    brief: 'Hands and bricks, close in. No faces needed for this one.' },
  { id: 'outside',            page: 'A Day',       title: 'Outside',
    brief: 'Break time, movement, the yard.' },
  { id: 'experiment',         page: 'A Day',       title: 'An experiment',
    brief: 'The lab-coat science session — concentration on one child’s face.' },
  { id: 'seminar-room',       page: 'Parents',     title: 'The seminar room',
    brief: 'Parents seated, presenter at the board. A parent-seminar session in progress.' },
  { id: 'eccd-trainee',       page: 'ECCD',        title: 'A trainee at work',
    brief: 'An ECCD trainee with a small group of children. The green ECCD polo is the recognisable detail.' },
  { id: 'training-room',      page: 'Why LPG',     title: 'The training room',
    brief: 'An ECCD session in progress — adults learning, materials on the table.' },
  { id: 'gate-and-building',  page: 'Find us',     title: 'The gate and the building',
    brief: 'How the school looks from the road, so a parent recognises it on approach.' },
  { id: 'building-daylight',  page: 'Our Story',   title: 'The building',
    brief: 'The school from outside, in daylight, with the sign legible.' },
  { id: 'other',              page: '—',           title: 'Something else',
    brief: 'Anything you think is worth having that is not on this list. Tell us what it is in the note.' }
];

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('LPG — send us photos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Exposed to the page so the shot list lives in exactly one place. */
function getSlots() {
  return SLOTS;
}

function getOrCreateFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/**
 * Receives one file. One request per file rather than a single large batch:
 * Apps Script caps a request at roughly 50MB, and a school uploading from a
 * phone on Nigerian mobile data will drop a big request long before a small one.
 */
function uploadFile(payload) {
  try {
    if (!payload || !payload.data) throw new Error('No file received.');
    if (!payload.consent) throw new Error('Consent confirmation is required.');

    var slot = null;
    for (var i = 0; i < SLOTS.length; i++) {
      if (SLOTS[i].id === payload.slotId) slot = SLOTS[i];
    }
    if (!slot) throw new Error('Unknown slot: ' + payload.slotId);

    var root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
    var folder = getOrCreateFolder_(root, slot.page + ' — ' + slot.title);

    var bytes = Utilities.base64Decode(payload.data);
    var blob = Utilities.newBlob(bytes, payload.mimeType, payload.name);
    var file = folder.createFile(blob);

    // The description travels with the file, so context is never lost from the
    // filename alone once these are pulled down for the website.
    file.setDescription(
      'Slot: ' + slot.page + ' / ' + slot.title +
      '\nSent by: ' + (payload.sender || 'not given') +
      '\nNote: ' + (payload.note || '—') +
      '\nParental consent confirmed by sender: yes' +
      '\nReceived: ' + new Date().toISOString()
    );

    logRow_(slot, payload, file);
    return { ok: true, name: payload.name, folder: folder.getName() };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

/**
 * A running log in a Sheet beside the folder. Consent was confirmed by a person
 * at a moment in time, and that assertion is worth keeping as a record rather
 * than only as a file property.
 */
function logRow_(slot, payload, file) {
  try {
    var root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
    var name = 'LPG upload log';
    var it = root.getFilesByName(name);
    var ss;
    if (it.hasNext()) {
      ss = SpreadsheetApp.open(it.next());
    } else {
      ss = SpreadsheetApp.create(name);
      DriveApp.getFileById(ss.getId()).moveTo(root);
      ss.getActiveSheet().appendRow(
        ['Received', 'Page', 'Slot', 'File', 'Sent by', 'Note', 'Consent confirmed', 'Link']);
    }
    ss.getActiveSheet().appendRow([
      new Date(), slot.page, slot.title, payload.name,
      payload.sender || '', payload.note || '', 'YES', file.getUrl()
    ]);
  } catch (e) {
    // Logging must never break an upload that already succeeded.
    console.warn('log failed: ' + e);
  }
}
