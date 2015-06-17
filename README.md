# task2_5
This is a nodejs/AngularJS app for study participant binding entry.

## Installation

Install [nodejs](nodejs.org) and npm. A mongodb server should be available as well.

```
npm install
bower install
```
and then
```
SECRET=<some secret> npm start
```
The secret is used to sign user tokens.

The app is reahced by http://localhost:8080/gentoken?uid=\<username\>.
The user name must be in the Users collection in the mongodb database. See Users schema.
