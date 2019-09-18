# trixelator
A desktop application to create photo mosaics with triangular pixels

![trixelation example](https://raw.githubusercontent.com/scanton/trixelator/master/images/adam.jpg "Trixelatemd Adam")


## Installation Instructions

You will need to install the latest version of [Node.js](https://nodejs.org/en/) to install this project.  If you are new to Node.js, you can download the most recent Node installer from the home page of their website.

Once Node.js is installed, clone this repository to your local machine.  If you are new to Git and aren't sure how to 'clone' this repository, you can click on the green "Clone or download" button on top of this page and/or use [GitHub Desktop](https://desktop.github.com/).

Once you have cloned this project to your local machine, open a Terminal/Command window and navigate to the directory you cloned this project to.  Then enter this command in the Terminal (note, on Windows you won't need 'sudo' but you will need to run the command prompt as Admin):

```bash
sudo npm install
```

This should install the node dependencies for this project.

To run the application, just type the following into the console:

```bash
npm start
```

## Using Trixelator

Trixelator is currently in active development.  The application works, click "Select Image" to choose an image from your local machine.  Once loaded, you can resize the window to scale teh image.  Choose the 'Base Width' for all triangles (expressed in pixels) and the 'Sample Size' is how many pixels should be used (square) to define the final color of the triangle.

For example, a Trixelation with a "Base Width" of 40 and a "Sample Size" of 15 will result in a mosaic of equlateral triangles of 40px length on each side.  The color of the triangle will be an average of the 15 (centermost) pixels inside the triangle.

You can play with the Base Width and Sample Size to create Trixelations with large triangular pixels.  A smaller sample size will make your colors more vivid (based on a few pixels) as opposed to a large sample size which can sometime expose more detail, while going too far will result in gray/muted colors.
