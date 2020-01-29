<p align="center">
  <img src="https://i.postimg.cc/76Ds5qGG/plexcord-logo-sm.png" alt="PlexCord"/>
</p>

<p align="center">🍿 a multi-chat-client bot that connects to a plex database and serves up raw media 🍿</p>

<p align="center">
  <a href="https://circleci.com/gh/scramble45/plexcord">
    <img src="https://circleci.com/gh/scramble45/plexcord.svg?style=svg&circle-token=bed9247683011820bcada7f98e26996aff25d0b5" alt="CircleCI"/>
  </a>
</p>


# Configuration

## Environmentals:

- `discord_token= # your discord bot token`
- `discord_cmdPrefix=/plexcord # defaults to ~!`
- `auth_password=password`
- `plexdb=./com.plexapp.plugins.library.db`
- `external_hostname=somehostname.com`

## Library configuration

These are your plex library numbers typically 1 or 2 or inversed.

```javascript
libraries: {
  'movies': 1,
  'tv': 2
}
```

## Startup:

Development:
> `npm run dev`

Production:
> `npm start`

## Commands:

Prefix:
> `~!`

Example command:
> `~! help`
