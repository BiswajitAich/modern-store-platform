import EditHero from "../_comp/EditHero";
import { PageProps } from "@/app/_lib/types";

import { fetchHeroEditData } from "../../_lib/adminDbCallAcrion";
const pageDataError = () => <div>No data / Unable to display data.</div>

const EditHeropage = async ({params}: PageProps) => {
    const { id } = await params;
    if (!id) {
        return pageDataError();
    }
    const heroData = await fetchHeroEditData(Number(id));
    if (!heroData) {
        return pageDataError();
    }
    return (
        <EditHero
            heroData={heroData}
        />
    );
};
export default EditHeropage;