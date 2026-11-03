import { useLanguage } from "../../hooks/useLanguage";

export default function NotFound() {
    const { t } = useLanguage();
    return(
        <>
        <h1>{t("not_found")}</h1>
        </>
    )
}