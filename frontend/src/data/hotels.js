/* =========================================================
   ZAN GATES — HOTEL CATALOG
   Single source of truth for both the Hotels listing
   page and each Hotel detail page.
   ========================================================= */

const HOTELS = [
  /* =======================================================
     KARATU / NORTHERN SAFARI CIRCUIT
     ======================================================= */
  {
    slug: "eileens-trees-inn-karatu",
    name: "Eileen's Trees Inn",
    location: "Karatu, Tanzania",
    tagline: "Mid-range lodge near Ngorongoro",
    description:
      "Eileen's Trees Inn is a comfortable mid-range lodge located in Karatu, just a short drive from the Ngorongoro Conservation Area.",
    highlights: [
      "Peaceful garden setting",
      "Spacious family rooms",
      "Swimming pool",
      "Restaurant serving local and international cuisine",
      "Free Wi-Fi",
      "Convenient location for Tarangire & Ngorongoro safaris",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789497075/Eileen_s_Trees_Inn_Karatu5_bc6nmd.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789497075/Eileen_s_Trees_Inn_Karatu2_yhtt1d.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789497075/Eileen_s_Trees_Inn_Karatu1_kkvqzt.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789497075/Eileen_s_Trees_Inn_Karatu3_c2iptz.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789497075/Eileen_s_Trees_Inn_Karatu4_agivms.jpg",
    ],
  },

  {
    slug: "farm-of-dreams-lodge-karatu",
    name: "Farm of Dreams Lodge",
    location: "Karatu, Tanzania",
    tagline: "Elegant lodge with landscaped gardens & highland views",
    description:
      "Farm of Dreams Lodge is an elegant lodge in Karatu offering a higher level of comfort with beautiful gardens and panoramic views over the Karatu Highlands. Ideal for families seeking extra comfort during their safari.",
    highlights: [
      "Beautiful landscaped gardens",
      "Spacious cottages and family rooms",
      "Outdoor swimming pool",
      "Excellent restaurant and bar",
      "Scenic views of the Karatu Highlands",
      "Ideal for families seeking extra comfort during their safari",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537919/Farm_of_Dreams_Lodge_Karatu5_d6gasa.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537918/Farm_of_Dreams_Lodge_Karatu4_tu5nzu.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537918/Farm_of_Dreams_Lodge_Karatu3_nmqxk0.jpg",
      // ⚠️ VERIFY: original URL had a broken extension — added .jpg below
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537918/Farm_of_Dreams_Lodge_Karatu1_eeweal.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537918/Farm_of_Dreams_Lodge_Karatu2_rl47zk.jpg",
    ],
  },

  /* =======================================================
     STONE TOWN
     ======================================================= */
  {
    slug: "tembo-house-hotel-stone-town",
    name: "Tembo House Hotel",
    location: "Stone Town, Zanzibar",
    tagline: "Historic seafront hotel in the heart of Stone Town",
    description:
      "A beautiful seafront option in the heart of Stone Town, with traditional Zanzibari architecture, swimming pools, and direct beachfront access. Tembo House is a classic choice for travellers wanting to be immersed in the history and atmosphere of Stone Town.",
    highlights: [
      "Traditional Zanzibari architecture",
      "Swimming pools",
      "Direct beachfront access",
      "Historic seafront location in Stone Town",
      "Walking distance to Forodhani Gardens and the Old Fort",
      "Ideal base for exploring Stone Town's UNESCO heritage",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537603/STONE_TOWN_Alternative2_dizrvg.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537603/STONE_TOWN_Alternative1_b0afnm.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537603/STONE_TOWN_Alternative3_qbtmv9.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537603/STONE_TOWN_Alternative4_f1cha1.jpg",
    ],
  },

  /* =======================================================
     NUNGWI
     ======================================================= */
  {
    slug: "max-hotel-nungwi-zanzibar",
    name: "Max Hotel Nungwi",
    location: "Nungwi, Zanzibar",
    tagline: "Beachside hotel, 3-min walk to Nungwi Beach",
    description:
      "Max Hotel Nungwi is the hotel included in your Zanzibar package — a comfortable, family-friendly stay just a short walk from one of Zanzibar's most beautiful beaches.",
    highlights: [
      "Just a short 3-minute walk to Nungwi Beach",
      "Comfortable air-conditioned rooms with private bathrooms",
      "On-site restaurant serving local and international cuisine",
      "Beautiful garden and terrace",
      "Free Wi-Fi",
      "Airport shuttle available (additional charge)",
      "Family-friendly accommodation with an excellent location for exploring Nungwi",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789497370/Max_Hotel_Nungwi_Zanzibar4_hjv6vo.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789497370/Max_Hotel_Nungwi_Zanzibar3_b2jbkl.jpg",
      // ⚠️ VERIFY: original URL had no extension — added .jpg below
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789497369/Max_Hotel_Nungwi_Zanzibar1_labvmd.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789497370/Max_Hotel_Nungwi_Zanzibar2_dx06nh.jpg",
    ],
  },

  {
    slug: "hotel-riu-jambo-nungwi",
    name: "Hotel Riu Jambo",
    location: "Nungwi, Zanzibar",
    tagline: "Beachfront resort, ideal for post-safari relaxation",
    description:
      "A beachfront resort in Nungwi, ideal for relaxing after the safari and enjoying Zanzibar's famous northern beaches. Spacious rooms, pools, and easy access to the white sands of Nungwi.",
    highlights: [
      "Beachfront location in Nungwi",
      "Ideal for relaxing after a safari",
      "Easy access to Zanzibar's famous northern beaches",
      "Swimming pools and resort facilities",
      "All-inclusive dining options",
      "Family-friendly accommodation",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537731/NUNGWI_Days_6_109_wjjal0.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537731/NUNGWI_Days_6_107_xvaysv.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537731/NUNGWI_Days_6_108_rzidfk.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537730/NUNGWI_Days_6_105_gx1kwr.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537730/NUNGWI_Days_6_106_pqglz8.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537729/NUNGWI_Days_6_103_d84jaf.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537729/NUNGWI_Days_6_104_o4w8qg.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789537729/NUNGWI_Days_6_101_m8lhqa.jpg",
    ],
  },

  {
    slug: "nungwi-beach-resort-by-turaco",
    name: "Nungwi Beach Resort by Turaco",
    location: "Nungwi, Zanzibar",
    tagline: "4-star beachfront resort surrounded by tropical gardens",
    description:
      "A beautiful beachfront resort surrounded by tropical gardens, with a large swimming pool and easy access to Nungwi Beach. A 4-star property perfectly placed for sunsets, swimming, and exploring the north of Zanzibar.",
    highlights: [
      "4-star beachfront resort",
      "Located on the famous Nungwi Beach",
      "Large swimming pool",
      "Restaurant & beach bar",
      "Family-friendly rooms",
      "Perfect for sunsets and swimming",
      "Walking distance to restaurants and local attractions",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538190/Turaco_Nungwi_Resort6_zhxees.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538190/Turaco_Nungwi_Resort4_ywvvrc.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538190/Turaco_Nungwi_Resort5_u4kcsv.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538189/Turaco_Nungwi_Resort2_eh45ne.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538190/Turaco_Nungwi_Resort3_mjsjnc.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538189/Turaco_Nungwi_Resort1_khfaa4.jpg",
    ],
  },

  {
    slug: "safirablu-luxury-resort-villas-zanzibar",
    name: "SafiraBlu Luxury Resort & Villas",
    location: "North East Coast, Zanzibar",
    tagline: "5-star luxury beachfront resort with private-pool villas",
    description:
      "SafiraBlu Luxury Resort & Villas is a 5-star beachfront resort on Zanzibar's northeast coast, about 20 minutes from Nungwi Beach. Spacious oceanfront villas — many with private pools — a private beach with stunning Indian Ocean views, an infinity pool, and fine dining make it an exceptional retreat.",
    highlights: [
      "5-star luxury beachfront resort",
      "Private beach with stunning Indian Ocean views",
      "Infinity swimming pool",
      "Spacious oceanfront villas, many with private pools",
      "Fine dining restaurant and beach bar",
      "Family-friendly accommodation with large villas available",
      "Located on the northeast coast, about 20 minutes from Nungwi Beach",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538057/SafiraBlu_Luxury_Resort_Villas_in_Zanzibar4_yp6z8e.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538057/SafiraBlu_Luxury_Resort_Villas_in_Zanzibar2_elhvxc.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538057/SafiraBlu_Luxury_Resort_Villas_in_Zanzibar5_ujb63r.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538057/SafiraBlu_Luxury_Resort_Villas_in_Zanzibar3_idkhyj.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538056/SafiraBlu_Luxury_Resort_Villas_in_Zanzibar1_vptuqp.jpg",
    ],
  },

  /* =======================================================
     JAMBIANI
     ======================================================= */
  {
    slug: "kupaga-villas-boutique-hotel-jambiani",
    name: "Kupaga Villas Boutique Hotel",
    location: "Jambiani, Zanzibar",
    tagline: "Boutique beachfront villas on the quiet east coast",
    description:
      "Kupaga Villas Boutique Hotel is an intimate beachfront retreat in Jambiani — a collection of elegant villas right on the sand, with a pool, oceanfront dining, and a peaceful atmosphere ideal for couples and families seeking privacy.",
    highlights: [
      "Boutique beachfront villas",
      "Direct beach access",
      "Swimming pool",
      "Oceanfront restaurant",
      "Quiet and relaxing location",
      "Great for families looking for privacy",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498069/Kupaga_Villas_Boutique_Hotel_Jambiani3_m2y7zt.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498069/Kupaga_Villas_Boutique_Hotel_Jambiani2_vxwkdv.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498069/Kupaga_Villas_Boutique_Hotel_Jambiani4_ynt2yi.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498067/Kupaga_Villas_Boutique_Hotel_Jambiani1_rvxfen.jpg",
    ],
  },

  {
    slug: "sharazad-boutique-hotel-jambiani",
    name: "Sharazād Boutique Hotel",
    location: "Jambiani, Zanzibar",
    tagline: "Luxury boutique hotel with tropical gardens",
    description:
      "Sharazād Boutique Hotel is a luxury beachfront property in Jambiani, set among tropical gardens with a swimming pool, a fine-dining restaurant, and direct access to one of Zanzibar's most beautiful turquoise-water beaches.",
    highlights: [
      "Luxury boutique beachfront hotel",
      "Tropical gardens",
      "Swimming pool",
      "Fine dining restaurant",
      "Beautiful beach with turquoise waters",
      "Family-friendly rooms",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498207/Sharaz%C4%81d_Boutique_Hotel_Jambiani6_pskj5e.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498207/Sharaz%C4%81d_Boutique_Hotel_Jambiani5_yq04se.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498207/Sharaz%C4%81d_Boutique_Hotel_Jambiani7_zcwzug.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498207/Sharaz%C4%81d_Boutique_Hotel_Jambiani3_p2og4w.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498206/Sharaz%C4%81d_Boutique_Hotel_Jambiani4_mctczb.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498205/Sharaz%C4%81d_Boutique_Hotel_Jambiani1_kffdgd.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498205/Sharaz%C4%81d_Boutique_Hotel_Jambiani2_qfds5c.jpg",
    ],
  },

  {
    slug: "mwezi-boutique-resort-jambiani",
    name: "Mwezi Boutique Resort",
    location: "Jambiani, Zanzibar",
    tagline: "Infinity pool & bungalows on the white-sand beach",
    description:
      "Mwezi Boutique Resort is a boutique beachfront resort on the white-sand shores of Jambiani — spacious bungalows in traditional Zanzibari style, an infinity pool facing the ocean, and an excellent restaurant with sea views. A peaceful setting ideal for relaxation.",
    highlights: [
      "Boutique beachfront resort",
      "Beautiful white-sand beach in Jambiani",
      "Infinity swimming pool",
      "Spacious bungalows with traditional Zanzibari style",
      "Excellent restaurant with ocean views",
      "Family-friendly accommodation",
      "Peaceful atmosphere, ideal for relaxation",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498421/Mwezi_Boutique_Resort6_xmfnkz.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498421/Mwezi_Boutique_Resort5_oqepm2.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498421/Mwezi_Boutique_Resort4_gdhxrl.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498421/Mwezi_Boutique_Resort3_titorh.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498420/Mwezi_Boutique_Resort2_rsjw0g.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789498420/Mwezi_Boutique_Resort1_scgs7y.jpg",
    ],
  },

    /* =======================================================
     SERENGETI — MAINLAND
     ======================================================= */
  {
    slug: "four-seasons-safari-lodge-serengeti",
    name: "Four Seasons Safari Lodge Serengeti",
    location: "Central Serengeti, Seronera",
    tagline: "Luxury 5-star lodge in the heart of the Serengeti",
    description:
      "Four Seasons Safari Lodge Serengeti is one of the strongest choices for premium clients — a luxury 5-star lodge in the Central Serengeti at Seronera, offering excellent service, beautiful views, and an unbeatable wildlife location.",
    highlights: [
      "Luxury / 5-star property",
      "Best for high-end and honeymoon clients",
      "Excellent luxury service",
      "Swimming pool and beautiful views",
      "Great wildlife location",
      "One of the strongest choices for premium clients",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538531/Four_Seasons_Safari_Lodge_Serengeti1_x5jny1.jpg",
    ],
  },

  {
    slug: "singita-sasakwa",
    name: "Singita Sasakwa",
    location: "Grumeti, Western Serengeti",
    tagline: "Ultra-luxury private safari lodge",
    description:
      "Singita Sasakwa is an ultra-luxury, exclusive lodge in the Grumeti Reserve of the Western Serengeti. Very high-end accommodation and spectacular views make it an exceptional choice for honeymoon and luxury packages.",
    highlights: [
      "Ultra-luxury property",
      "Best for luxury/private safari clients",
      "Exclusive lodge",
      "Very high-end accommodation",
      "Spectacular views",
      "Excellent for honeymoon and luxury packages",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538535/Singita_Sasakwa1_mwyqnx.jpg",
    ],
  },

  {
    slug: "serengeti-safari-lodge",
    name: "Serengeti Safari Lodge",
    location: "Seronera, Central Serengeti",
    tagline: "Luxury safari lodge at a flexible price point",
    description:
      "Serengeti Safari Lodge is a luxury safari lodge in Seronera, Central Serengeti — a convenient central location with good access to wildlife, suitable for couples and families, at a more flexible price point than the premium lodges.",
    highlights: [
      "Luxury safari lodge",
      "Best for luxury safari at a more flexible price point",
      "Convenient central location",
      "Good access to wildlife",
      "Suitable for couples and families",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538533/Serengeti_Safari_Lodge1_mkedpf.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538534/Serengeti_Safari_Lodge2_udmwbs.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538534/Serengeti_Safari_Lodge3_mgjfxu.webp",
    ],
  },

  {
    slug: "serengeti-serena-safari-lodge",
    name: "Serengeti Serena Safari Lodge",
    location: "Central Serengeti",
    tagline: "Traditional safari lodge in the Central Serengeti",
    description:
      "Serengeti Serena Safari Lodge is an upper-mid-range / luxury property in the Central Serengeti — a well-established safari lodge with an excellent Serengeti location and an easy combination with Tarangire and Ngorongoro.",
    highlights: [
      "Upper-mid-range / luxury property",
      "Best for clients wanting a traditional safari lodge",
      "Established safari property",
      "Excellent Serengeti location",
      "Good option for combining with Tarangire and Ngorongoro",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538537/Serengeti_Serena_Safari_Lodge1_kr4xoc.webp",
    ],
  },

  {
    slug: "serengeti-bushtops-luxury-camp",
    name: "Serengeti Bushtops Luxury Camp",
    location: "Northern Serengeti",
    tagline: "Luxury tented camp in the Northern Serengeti",
    description:
      "Serengeti Bushtops Luxury Camp is a luxury tented camp in the Northern Serengeti — strong wilderness atmosphere and luxury tented accommodation, particularly attractive for clients interested in the Great Migration.",
    highlights: [
      "Luxury tented camp",
      "Best for migration and luxury safari experiences",
      "Luxury tented accommodation",
      "Strong wilderness atmosphere",
      "Particularly attractive for clients interested in the Great Migration",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538532/Serengeti_Bushtops_Luxury_Camp1_uevx0a.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538532/Serengeti_Bushtops_Luxury_Camp2_okowaw.jpg",
    ],
  },

  /* =======================================================
     KARATU / NGORONGORO AREA — MAINLAND
     ======================================================= */
  {
    slug: "acacia-farm-lodge-karatu",
    name: "Acacia Farm Lodge",
    location: "Karatu, Tanzania",
    tagline: "Luxury farm-style lodge in Karatu",
    description:
      "Acacia Farm Lodge is a luxury property in Karatu with beautiful gardens, spacious rooms, and a warm farm-style atmosphere — an excellent option before or after a Ngorongoro Crater safari.",
    highlights: [
      "Luxury property",
      "Best for couples, families and general safari packages",
      "Beautiful gardens",
      "Spacious rooms",
      "Farm-style atmosphere",
      "Excellent option before/after Ngorongoro",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538531/Acacia_Farm_Lodge1_r2adoz.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538531/Acacia_Farm_Lodge2_epxffn.jpg",
    ],
  },

  {
    slug: "nyota-rift-valley-karatu",
    name: "Nyota Rift Valley",
    location: "Karatu Area, Tanzania",
    tagline: "High-end luxury lodge for premium clients",
    description:
      "Nyota Rift Valley is a luxury / high-end property in the Karatu area, highly rated by recent guests for its excellent service and beautiful surroundings — a superb choice for premium clients and honeymooners.",
    highlights: [
      "Luxury / high-end property",
      "Best for premium clients and honeymooners",
      "Excellent service",
      "Beautiful surroundings",
      "Very highly rated by recent guests",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538532/Nyota_Rift_Valley1_crgher.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538533/Nyota_Rift_Valley2_ustiy7.jpg",
    ],
  },

  {
    slug: "kitela-lodge-karatu",
    name: "Kitela Lodge",
    location: "Karatu, Tanzania",
    tagline: "Intimate luxury lodge in Karatu",
    description:
      "Kitela Lodge is a luxury property in Karatu with spacious accommodation, beautiful setting, and a more intimate lodge experience — perfect for couples and luxury safari packages.",
    highlights: [
      "Luxury property",
      "Best for couples and luxury safari packages",
      "Spacious accommodation",
      "Beautiful setting",
      "More intimate lodge experience",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538531/Kitela_Lodge1_zgxhrg.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538531/Kitela_Lodge2_qqwhvm.jpg",
    ],
  },

  {
    slug: "ngorongoro-coffee-lodge-karatu",
    name: "Ngorongoro Coffee Lodge",
    location: "Karatu, Tanzania",
    tagline: "Nature-focused lodge on a coffee estate",
    description:
      "Ngorongoro Coffee Lodge is a luxury / upper-mid-range property in Karatu, surrounded by a working coffee estate. Comfortable rooms and a quiet atmosphere make it a good safari stopover — highly rated by travellers.",
    highlights: [
      "Luxury / upper-mid-range property",
      "Best for clients who like nature and a quieter atmosphere",
      "Coffee-estate surroundings",
      "Comfortable rooms",
      "Good safari stopover",
      "Highly rated by travellers",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538531/Ngorongoro_Coffee_Lodge1_fv9rop.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538532/Ngorongoro_Coffee_Lodge1_shswu5.webp",
    ],
  },

  {
    slug: "the-plantation-lodge-safaris-karatu",
    name: "The Plantation Lodge & Safaris",
    location: "Karatu, Tanzania",
    tagline: "Luxury boutique lodge with large private-style rooms",
    description:
      "The Plantation Lodge & Safaris is a luxury boutique lodge in Karatu — large private-style accommodation, beautiful gardens, and an excellent atmosphere to unwind after a long safari day. Especially suited to romantic and premium safari packages.",
    highlights: [
      "Luxury boutique lodge",
      "Best for romantic and premium safari packages",
      "Large private-style accommodation",
      "Beautiful gardens",
      "Excellent atmosphere after a long safari day",
    ],
    images: [
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538538/The_Plantation_Lodge_Safaris1_fljoeo.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538537/The_Plantation_Lodge_Safaris2_emztu3.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538537/The_Plantation_Lodge_Safaris3_s4irky.jpg",
      "https://res.cloudinary.com/djczmay2i/image/upload/v1789538537/The_Plantation_Lodge_Safaris3_a37fzd.webp",
    ],
  },
];

export default HOTELS;

export const getHotelBySlug = (slug) =>
  HOTELS.find((h) => h.slug === slug) || null;