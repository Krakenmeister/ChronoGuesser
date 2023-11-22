const fs = require("fs");

for (let i = 37; i > 0; i--) {
  fs.renameSync(
    `./public/img/animations/delivery_victorian/frame_${i - 1}.png`,
    `./public/img/animations/delivery_victorian/frame_${i}.png`,
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
}
