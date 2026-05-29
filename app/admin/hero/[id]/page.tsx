import EditHero from "../_comp/EditHero";

import { fetchHeroEditData } from "../../_lib/adminDbCallAcrion";
const pageDataError = () => <div>No data / Unable to display data.</div>

const EditHeropage = async (props: PageProps<'/admin/hero/[id]'>) => {
    const { id } = await props.params;
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