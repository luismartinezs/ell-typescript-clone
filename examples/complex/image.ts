// TODO make it work
import * as  ell from '@/ell'
import sharp from 'sharp';
import * as path from 'path';

ell.init({})

const describeImage = ell.complex({
  // gpt-4o-mini can take images
  model: 'gpt-4o-mini',
}, async (image) => {
  return [
    ell.system('Describe the contents of the image in detail'),
    ell.user([
      "What do you see in this image?",
      image
    ]),
  ]
})

; (async () => {
  const image = await sharp(path.join(__dirname, 'cat.jpeg')).toBuffer();
  const result = await describeImage(image)
  console.log(result.text)
})()
