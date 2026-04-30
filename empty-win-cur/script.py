import struct, os, io
from PIL import Image

# create transparent 32x32 PNG/BMP data for CUR using BMP DIB without file header
size=32
img=Image.new("RGBA",(size,size),(0,0,0,0))
# Build BMP info header + pixels + AND mask
# CUR/ICO BMP stores height doubled (xor+and)
biSize=40
width=size
height=size*2
planes=1
bitcount=32
compression=0
imgsize=size*size*4
xppm=yppm=0
clrused=0
clrimportant=0
hdr=struct.pack("<IIIHHIIIIII",biSize,width,height,planes,bitcount,compression,imgsize,xppm,yppm,clrused,clrimportant)
# pixel data BGRA bottom-up
pixels=bytearray()
for y in range(size-1,-1,-1):
    for x in range(size):
        r,g,b,a=img.getpixel((x,y))
        pixels += bytes([b,g,r,a])
# AND mask rows padded to 4-byte boundary; 1bpp all 1s hides all
row_bytes=((size +31)//32)*4
mask=bytearray()
for y in range(size):
    mask += b'\xff'*row_bytes
dib=hdr+pixels+mask

# CUR header
reserved=0
type_cur=2
count=1
header=struct.pack("<HHH",reserved,type_cur,count)
# entry
width_b=32
height_b=32
colorcount=0
reserved_b=0
hotx=0
hoty=0
bytesinres=len(dib)
offset=6+16
entry=struct.pack("<BBBBHHII",width_b,height_b,colorcount,reserved_b,hotx,hoty,bytesinres,offset)
data=header+entry+dib
path='./empty_cursor.cur'
with open(path,'wb') as f:
    f.write(data)
print(f"Saved {path}, {len(data)} bytes")
