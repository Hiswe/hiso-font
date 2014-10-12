# Hiso Font

## Isometric 3D font 0.3.0

Pictogram and font can be viewed at :

- [hiswe.github.io/hiso-font](http://hiswe.github.io/hiso-font)
- [hiswe.deviantart.com/#/d5p7i64](http://hiswe.deviantart.com/#/d5p7i64)

## Use
Can be installed with [bower](http://bower.io/)

```
bower install hiso-font --save
```

### Font

```
<link rel="stylesheet" href="dst/hiso-dark-font.css">
<link rel="stylesheet" href="dst/hiso-bright-font.css">
<link rel="stylesheet" href="dst/hiso-plain-font.css">
```

In your CSS you just have to:

```
h1 {
  font-family: 'hiso-dark';
  line-height: 100%;
}
h2 {
  font-family: 'hiso-bright';
  line-height: 100%;
}
h3 {
  font-family: 'hiso-plain';
  line-height: 100%;
}
```
### Icons

**Icons classes are no more on 0.3.0**   
**It will come back on a upcoming version**

~~There is some icon class that come with this font:~~

~~<link rel="stylesheet" href="font/hicon.css">~~

~~In your HTML you just have to:~~

~~<span class="hicon mail"></span>~~

~~The full list of icons class are available [here](https://github.com/Hiswe/hiso-font/blob/master/font/hicon.css).~~

## Release History

- **0.3.0**
  - Font build is now handled with [gulp](gulpjs.com)
  - Each font as a separate css-file
  - More icons can be found on [private use area](http://en.wikipedia.org/wiki/Private_Use_Areas).
- **0.2.2**
  - Add some punctuation char ```. : ; \ < - > / ```
- **0.2.1**
  - Shrink HisoPlain to fix aliasing issues when this font is used as a background for another Hiso typo
- **0.2.0**
  - Add icons to every font
  - Remove Heart &amp; Education icon
  - Same baseline for all fonts
- **0.1.2**
  - Fix the "h" in dark version
  - Change unicode for "website" icon and add a mirrored version
  - Remove svg files
- **before** — Initial comits and stuff

## License
Version 0.2.0 of the Font are licensed under CC BY 3.0:
[creativecommons.org/licenses/by-nc/3.0/](http://creativecommons.org/licenses/by-nc/3.0/)
A mention of *'Hiso Font - https://github.com/Hiswe/hiso-font'*
in human-readable source code is considered acceptable attribution (most common on the
web).
If human readable source code is not available to the end user, a mention in an 'About'
or 'Credits' screen is considered acceptable (most common in desktop or mobile software).
