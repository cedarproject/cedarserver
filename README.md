Cedar
===========

Cedar is an open source show control application designed for churches. Cedar handles multimedia, presentations, song lyrics, and lighting, all controlled simultaneously over a network. Built using the Meteor framework, Cedar is almost entirely web-based, allowing greater flexibility than other church media software.

Cedar is currently in pre-alpha status, so not all features work properly.

Installation
============

Cedar requires the following software:

* Meteor
* FFMpeg (LibAV has not been tested but will probably work too)
* GraphicsMagick

After installing the above and downloading Cedar, then simply run command `meteor` in Cedar's directory. On first start, Meteor will download and install multiple packages, this will take some time. Once Meteor starts the application, open a browser to http://localhost:3000/.

About Cedar
===========

> I plan to redesign a lot of how Cedar is structured in the near future, changing the "Minions" concept into something more intuitive. (I originally planned the Media minion to be a separate program, not browser-based.) -- Isaac

Cedar is composed of many different parts that work together:

  * Minions: Minons handle instructions from Cedar and perform certain actions, like displaying media files or controlling lights. Minions are sorted into Stages, allowing one Cedar server to control minions in multiple areas simultaneously.
  * Media: Users can upload videos, images, and audio to be displayed by Media minions.
  * Presentations: Users can create presentations to be displayed by Media minions.
  * Songs: Songs contain both song lyrics and (optionally) chords, lyrics are displayed by media minions while chord charts are displayed by Music Stand.
  * Music Stand: Displays song lyrics and chord charts, automatically scrolling to the currently active lyrics.
  * Lighting: Defines light fixtures, groups of lights, light scenes, and consoles. Control of light fixtures is handled by the separate lighting minion software.
  * Sets: Sets are the mainstay of Cedar, allowing media, presentations, songs, and light scenes to be added to a playlist-like Set. Set actions can trigger other actions simultaneously, for example a song triggering a background image and multiple light scenes.

Quick Start
===========

From Cedar's homepage, select Minions from the menu. Click the "Add Stage" button to create a new Stage. Press the gear icon by to new stage to change its title. After creating a Stage, click the "Add Web Minion" button to create a new Media minion. Click the gear icon by the new media minion, then change its title as desired and change its Stage to the Stage created previously. At the bottom of the page, open the "Launch web minion" link in a new tab or window, this will be Cedar's display output.

Next, do any of the following:
  * Upload media files from the Media page
  * Create presentations from the Presentations page
  * Create songs from the Songs page

After one or more items have been added or created, go to the Sets page and click the "Add Set" button. From the new Set's page, click the gear icon to expand the Set's settings, then set its title as desired and change its Stage to the Stage created previously. Click the gear again to close the settings panel, then click the "Add Item" button to open the item selection window. Click the "+" button by any of the items created previously to add it to the Set. Add more items as desired.

Click on any of the items added to activate them, if the action is a media, song, or presentation item it will be displayed on the Media minion tab opened previously. Click the "x All" button in the bottom-right of the Sets window to deactivate the selected item, or click the other buttons to only clear specific display layers.

Click the gear icon by each Action item to open its settings pane, where you can set the Action's title, configure action-specific settings, and attach trigger Actions that will be performed when the Action is clicked. Click the up-and-down-arrows icon to start moving an Action, click another action to move the first action into its place.

> Note: This documentation is terrible. I'll try to fix it. Eventually. -- Isaac

Credits
=======

Cedar is designed and developed by Isaac "hunternet93" Smith.

The Cedar logo was created by jilllio and released into public domain on openclipart.org ([https://openclipart.org/detail/224342/Young-Cedar-Tree Link to image])
