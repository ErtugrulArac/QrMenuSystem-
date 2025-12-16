"use client"

import imageCompression from 'browser-image-compression';
import React, { useEffect, useState } from 'react';
import SelectCategory from '../selectCategory';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { oneProductType } from '@/types';
import ButtonProduct from '../buttonProduct';
import { toast } from 'react-toastify';
import { url } from "@/lib/url"
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "@/utils/firebase"



const Index =  () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState(0);


  const [prop, setProp] = useState("");
  const [imageName, setImageName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  const [id, setId] = useState("");

  useEffect(() => {
    // Check if 'file' is not null before proceeding
    if (file) {
      const storage = getStorage(app);

      const upload = () => {
        const name = new Date().getTime() + file.name;
        const storageRef = ref(storage, name);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                break;
              case "running":
                toast.info("Bekleyin! Resim yükleniyor...")
                break;
            }
          },
          (error) => {
            // Handle upload error
            console.error("Error uploading: ", error);
          },
          () => {
            // Upload completed successfully
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setImageName(downloadURL);
              toast.success("Resim başarıyla yüklendi!")
              // Set the download URL or do something with it
            });
          }
        );
      };

      // Call the upload function
      upload();
    }
  }, [file]); // Add dependencies if needed

  const { isLoading, error, data: allProducts } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      fetch(`${url}/api/getProducts?page=1&limit=3000`).then((res) => res.json()),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${url}/api/getProducts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName: selectedItem,
          productName: productName,
          productDescription: productDescription,
          productPrice: productPrice,
          productImage: imageName,
        }),
      });
    },
    onSuccess(result) {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if(result.ok) {
        toast.success("Ürün Eklendi!")
      }
      if (result.status === 400) {
        result.json().then((data) => {
          toast.error(data.message);
        })
      }
    },
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    mutation.mutate();
    form.reset();
  };

  const deleteProduct = async (productName: string, image: string) => {
    try {

      await deleteImage(image);

      const response = await fetch(`${url}/api/getProducts`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: productName,
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        toast.success("Ürün Silindi!")
      } else {
        toast.error("Ürün Silinemedi!")
      }
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const [searchTerm, setSearchTerm] = useState<string>('');

  if (isLoading) return "Loading...";

  // data dizisini searchTerm'e göre filtrele
  const filteredData = allProducts.filter((item: oneProductType) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const compressImage = async (file: File) => {
    try {
      const options = {
        maxSizeMB: 1, // Max dosya boyutu megabayt cinsinden
        maxWidthOrHeight: 500, // Max genişlik veya yükseklik piksel cinsinden
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Dosya sıkıştırma hatası:', error);
      return null;
    }
  };

  const deleteImage = async (image: string) => {
    try {
        const storage = getStorage(app);
        const imageRef = ref(storage, image);
        await deleteObject(imageRef);
        toast.success("Resim başarıyla silindi!");
    } catch (error) {
        console.error("Resim silinirken hata oluştu: ", error);
        toast.error("Resim silinirken bir hata oluştu.");
    }
};

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      const compressedFile = await compressImage(selectedFile);

      if (compressedFile) {
        setFile(compressedFile);
      } else {
        // Dosya boyutu istenilenin üzerinde, kullanıcıya uyarı gösterilebilir
        alert("Dosya boyutu istenilenin üzerinde. Lütfen daha küçük bir dosya seçin.");
      }
    }
  };

  return (
    <div className='px-4 md:px-0'>
      <div>
        <h4 className='font-semibold ml-0 md:ml-2 underline mt-3 text-sm md:text-base'>Ürün Ekle</h4>
        <form onSubmit={
          (e) => {
            handleUpdate(e);
          }
        } className='flex flex-col gap-3 md:gap-4 items-center justify-around w-full md:w-[90%] m-auto mt-4'>
          <input onChange={(e) => {
            setProductName(e.target.value)
          }} className='border border-black rounded-sm px-3 py-2 w-full text-sm md:text-base' type="text" placeholder='Ürün İsmi..' />
          <input
            type="file"
            id='image'
            onChange={handleFileChange}
            className='w-full text-sm md:text-base'
          />
          <input onChange={(e) => {
            setProductDescription(e.target.value)
          }} className='border border-black rounded-sm px-3 py-2 w-full text-sm md:text-base' type="text" placeholder='Ürün açıklaması (opsiyonel)..' />
          <input onChange={(e) => {
            const price = parseInt(e.target.value)
            setProductPrice(price)
          }} className='border border-black rounded-sm px-3 py-2 w-full text-sm md:text-base' type="number" placeholder='Fiyat..' />
          <SelectCategory selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
          <button type="submit" className='border border-black text-white rounded bg-black px-4 py-3 w-full text-sm md:text-base hover:bg-gray-800 transition-colors'>Ürün Ekle</button>
        </form>
      </div>

      <h4 className='font-semibold ml-0 md:ml-2 underline mt-7 text-sm md:text-base'>Ürün Düzenle</h4>
      {/* Arama kutusu */}
      <input
        type="text"
        placeholder="Ürün Ara"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='ml-0 md:ml-2 mt-2 p-2 border border-gray-300 rounded w-full md:w-auto text-sm md:text-base'
      />

      {/* Filtrelenmiş veriyi göster */}
      {filteredData.map((item: oneProductType) => (
        <div key={item.name} className='flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-300 py-3 md:py-2 w-full md:w-[90%] m-auto gap-2 sm:gap-0'>
          <p className='ml-0 md:ml-2 font-semibold text-sm md:text-base break-words flex-1 min-w-0'>{item.name}</p>
          <div className='flex flex-row gap-2 w-full sm:w-auto'>
            <button 
              onClick={async () => {
                setProp(item.name);
                setImageName(item.image);
                setDesc(item.description);
                setPrice(item.price);
                setId(item.id);
              }}
              className='flex-1 sm:flex-initial'
            >
              <ButtonProduct image={imageName} mainNamee={prop} price={price} desc={desc} id={id} />
            </button>
            <button onClick={() => {
              const userConfirmed = window.confirm("Onaylıyor musunuz?");
              if (userConfirmed) {
                deleteProduct(item.name, item.image);
              } else {
                null;
              }
            }} className='bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 md:px-4 rounded text-sm md:text-base transition-colors flex-1 sm:flex-initial'>Sil</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Index;
