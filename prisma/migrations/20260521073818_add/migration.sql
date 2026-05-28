-- AddForeignKey
ALTER TABLE "hero_banners" ADD CONSTRAINT "hero_banners_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
