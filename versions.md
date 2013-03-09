---
layout: page
title: Versions
---

Versions
========

There are various versions of the app. This page aims to clarify what each
version is and what's its purpose is. Quirks of individual implementations are
detailed in the individual pages for each version.

Overview
--------

The core app is a [Web App](http://en.wikipedia.org/wiki/Web_App). The
definition can be quite vague, but essentially means that it is written with
HTML5 and Javascript.

The app uses standard HTML5 elements for markup; CSS3 for transitions and
animations; Javascript for main program logic; and HTML5 APIs for device
interaction such as Geolocation.

The advantages of a Web App include zero-install: users need not specifically
anything before starting to use the app; another advantage is that users always
have the latest version of the app since they are always accessing it 'live'
from the server.

Disadvantages of this approach traditionally meant permanent internet connection
was required and lack of hardware access. However with HTML5's new APIs these
problems are mostly mitigated. Web Apps can cache data and files for offline use
and some hardware functions are accessible through APIs.

PhoneGap
--------

[PhoneGap](http://phonegap.com/) is a framework for Web Apps which essentially
[polyfills](http://en.wikipedia.org/wiki/Polyfill) some APIs phone web browsers
don't support but the devices do natively.

What is produced is a native app to be installed on users' devices alongside
other apps.

PhoneGap Build
--------------

A [service](http://build.phonegap.com) provided by the PhoneGap people which
means the developer doesn't need to download the development environments and
SDKs for all the platform to be targeted. Currently 6 platforms are supported
through PhoneGp Build.

Android, iOS, Windows Phone, Blackberry, WebOS, Symbian
-------------------------------------------------------

These platform versions are all produced currently by the PhoneGap build service.
