import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const ProductsPage = () => (
  <div className="bg-orange-50 py-16 md:py-24 min-h-[calc(100vh-13rem)]">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.h1 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-5xl font-extrabold text-center text-orange-600 mb-16"
      >
        Our Delicious Meal Offerings
      </motion.h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[
          { name: "Classic Veg Thali", description: "A balanced meal with 2 sabzis, dal, roti/rice, salad, and a sweet.", price: "₹150", imageKey: "veg-thali", alt: "Classic Vegetarian Thali" },
          { name: "North Indian Special", description: "Flavorful curries, parathas, raita, and special rice.", price: "₹180", imageKey: "north-indian-special", alt: "North Indian Special Meal Box" },
          { name: "South Indian Delight", description: "Idli/Dosa, sambar, chutney, and vada. Light and tasty.", price: "₹160", imageKey: "south-indian-delight", alt: "South Indian Delight Meal Box" },
          { name: "Healthy Sprouts Salad", description: "A mix of fresh sprouts, veggies, and a tangy dressing.", price: "₹120", imageKey: "sprouts-salad", alt: "Healthy Sprouts Salad" },
          { name: "Homestyle Chicken Curry", description: "Tender chicken in a rich, aromatic gravy with rice/roti.", price: "₹220", imageKey: "chicken-curry", alt: "Homestyle Chicken Curry" },
          { name: "Chef's Special Combo", description: "A surprise combo curated by our home cooks for the day.", price: "₹190", imageKey: "chefs-special", alt: "Chef's Special Combo Meal" },
        ].map((product, index) => (
          <motion.div 
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:shadow-2xl transition-shadow duration-300 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <img  alt={product.alt} className="w-full h-56 object-cover" src="https://images.unsplash.com/photo-1694388001616-1176f534d72f" />
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-2xl font-semibold text-orange-600 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">{product.description}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-2xl font-bold text-green-600">{product.price}</span>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg">Order Now</Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default ProductsPage;