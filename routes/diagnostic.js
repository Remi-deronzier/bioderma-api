const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Diagnostic = require("../models/Diagnostic");
const isAuthenticated = require("../middlewares/isAuthenticated");

// route to create a diagnostic (except pictures)

router.post("/diagnostic/create", isAuthenticated, async (req, res) => {
  console.log("route : /diagnostic/create");
  console.log(req.fields);
  try {
    const { name, description, category } = req.fields;
    if (!name) {
      res.status(400).json({
        message: "You must specify a name to your picture at least",
      });
    } else {
      const newDiagnostic = new Diagnostic({
        name: name,
        description: description,
        category: category,
        patient: req.user,
      });
      await newDiagnostic.save();
      res.status(200).json(newDiagnostic);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// route to upload pictures for a diagnostic

router.put(
  "/diagnostic/upload-picture/:id?",
  isAuthenticated,
  async (req, res) => {
    console.log("route: /diagnostic/upload-picture/:id?");
    console.log(req.params);
    console.log(req.files);
    if (req.params.id) {
      try {
        const diagnostic = await Diagnostic.findById(req.params.id);
        if (diagnostic) {
          if (String(req.user._id) === String(diagnostic.patient._id)) {
            const files = req.files; // upload several pictures
            const fileKeys = Object.keys(files);
            if (fileKeys.length !== 0) {
              if (Object.keys(diagnostic.images).length === 0) {
                // case when no picture has been uploaded yet
                if (fileKeys.length <= 5) {
                  // prevent user from uploading more than 5 pictures
                  const promises = fileKeys.map(async (element) => {
                    try {
                      const picture = await cloudinary.uploader.upload(
                        files[element].path,
                        {
                          folder: `/bioderma/diagnostics/${diagnostic._id}`,
                        }
                      );
                      return picture;
                    } catch (error) {
                      return res.status(400).json({ message: error.message });
                    }
                  });
                  const pix = await Promise.all(promises);
                  console.log(Object.keys(diagnostic.images));
                  console.log(diagnostic.images);
                  diagnostic.images = pix;
                  await diagnostic.save();
                  res.status(200).json(diagnostic);
                } else {
                  res
                    .status(400)
                    .json({ message: "You can't upload more than 5 pictures" });
                }
              } else {
                // case when some pictures already exist in the DB
                if (fileKeys.length + diagnostic.images.length <= 5) {
                  // prevent user from uploading more than 5 pictures
                  const promises = fileKeys.map(async (element) => {
                    try {
                      const picture = await cloudinary.uploader.upload(
                        files[element].path,
                        {
                          folder: `/bioderma/diagnostics/${diagnostic._id}`,
                        }
                      );
                      return picture;
                    } catch (error) {
                      return res.status(400).json({ message: error.message });
                    }
                  });
                  const pix = await Promise.all(promises);
                  console.log(Object.keys(diagnostic.images));
                  console.log(diagnostic.images);
                  await diagnostic.images.push(...pix);
                  diagnostic.markModified("images"); // update the array in the DBS
                  await diagnostic.save();
                  res.status(200).json(diagnostic);
                } else {
                  res
                    .status(400)
                    .json({ message: "You can't upload more than 5 pictures" });
                }
              }
            } else {
              res.status(400).json({ message: "Missing parameters" });
            }
          } else {
            res.status(401).json({ message: "Unauthorized" });
          }
        } else {
          res.status(400).json({ message: "Diagnostic not found" });
        }
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(400).json({ message: "Missing ID parameter" });
    }
  }
);

// route to delete one picture from a diagnostic

router.delete(
  "/diagnostic/delete-picture/:id?",
  isAuthenticated,
  async (req, res) => {
    console.log("router: /diagnostic/delete-picture/:id?");
    console.log(req.params);
    console.log(req.fields);
    if (req.params.id) {
      try {
        const diagnostic = await Diagnostic.findById(req.params.id);
        if (diagnostic) {
          if (String(req.user._id) === String(diagnostic.patient._id)) {
            if (req.fields.picture_id) {
              let indexOfImageToDelete;
              diagnostic.images.forEach((image, index) => {
                if (image.public_id === req.fields.picture_id) {
                  indexOfImageToDelete = index;
                }
              });
              console.log(indexOfImageToDelete);
              if (typeof indexOfImageToDelete == "number") {
                await cloudinary.api.delete_resources([
                  diagnostic.images[indexOfImageToDelete].public_id,
                ]);
                diagnostic.images.splice(indexOfImageToDelete, 1);
                diagnostic.markModified("images"); // update the array in the DBS
                await diagnostic.save();
                res
                  .status(200)
                  .json({ message: "Picture successfully deleted!" });
              } else {
                res.status(400).json({ message: "Picture not found" });
              }
            } else {
              res.status(400).json({ message: "Missing parameters" });
            }
          } else {
            res.status(401).json({ message: "Unauthorized" });
          }
        } else {
          res.status(400).json({ message: "Diagnostic not found" });
        }
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(400).json({ message: "Missing ID parameter" });
    }
  }
);

// route to update a dignostic (except pictures)

router.put("/diagnostic/update/:id?", isAuthenticated, async (req, res) => {
  console.log("route: /diagnostic/update");
  console.log(req.fields);
  console.log(req.params);
  if (req.params.id) {
    try {
      const diagnostic = await Diagnostic.findById(req.params.id);
      if (!diagnostic) {
        res.status(400).json({ message: "this diagnostic doesn't exist" });
      } else {
        if (String(req.user._id) === String(diagnostic.patient._id)) {
          // check that the token match with the owner of the ad
          const { name, description, category } = req.fields;
          if (
            !name &&
            !description &&
            !category // check that at least one modification of the ad has been specified by the user
          ) {
            res.status(400).json({ message: "Missing parameters" });
          } else {
            const reqKeys = Object.keys(req.fields);
            let diagnosticUpdated = reqKeys.reduce((obj, element) => {
              switch (element) {
                case "name":
                  obj.name = name;
                  break;
                case "description":
                  obj.description = description;
                  break;
                case "category":
                  obj.category = category;
                  break;
              }
              return obj;
            }, diagnostic);
            await diagnosticUpdated.save();
            res
              .status(200)
              .json({ message: "Diagnostic successfully updated" });
          }
        } else {
          res.status(401).json({ message: "Unauthorized" });
        }
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to delete a diagnostic

router.delete("/diagnostic/delete/:id?", isAuthenticated, async (req, res) => {
  console.log("route: /diagnostic/delete");
  console.log(req.params);
  if (req.params.id) {
    try {
      const diagnostic = await Diagnostic.findById(req.params.id);
      if (diagnostic) {
        if (String(req.user._id) === String(diagnostic.patient._id)) {
          // check that the token match with the owner of the ad
          console.log(Object.keys(diagnostic.images).length);
          if (Object.keys(diagnostic.images).length !== 0) {
            const picturesToDelete = diagnostic.images.map(
              (element) => element.public_id
            );
            await cloudinary.api.delete_resources(picturesToDelete);
          }
          await cloudinary.api.delete_folder(
            `/bioderma/diagnostics/${diagnostic._id}`
          );
          await Diagnostic.findByIdAndDelete(req.params.id);
          res.status(200).json({ message: "Diagnostic successfully deleted" });
        } else {
          res.status(401).json({ message: "Unauthorized" });
        }
      } else {
        res.status(400).json({ message: "Diagnostic not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to get a diagnostic

router.get("/diagnostic/:id", isAuthenticated, async (req, res) => {
  console.log("route: /diagnostic/:id");
  console.log(req.params);
  if (req.params.id) {
    try {
      const diagnostic = await Diagnostic.findById(req.params.id).populate(
        "patient"
      );
      if (diagnostic) {
        res.status(200).json(diagnostic);
      } else {
        res.status(400).json({ message: "Diagnostic not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to get all diagnostics of one user

router.get("/diagnostics/user/:user_id?", isAuthenticated, async (req, res) => {
  console.log("route: /diagnostics/user/:user_id?");
  console.log(req.params);
  if (req.params.user_id) {
    if (String(req.user._id) === String(req.params.user_id)) {
      try {
        const diagnosticsAgregation = await Diagnostic.find().populate(
          "patient"
        );
        const diagnostics = diagnosticsAgregation.filter(
          (diagnostic) =>
            String(diagnostic.patient._id) === String(req.params.user_id) // Important not to forget the String to compare strings between strings
        );
        res.status(200).json(diagnostics);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(400).json({ message: "Missing ID paramters" });
  }
});

module.exports = router;
