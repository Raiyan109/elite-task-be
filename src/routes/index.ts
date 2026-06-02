import { Router } from 'express';
import { AdminRegRoutes } from '../modules/Admin/admin.routes';
import { UserRoutes } from '../modules/User/user.route';
import { WebSettingsRoutes } from '../modules/WebSettings/webSettings.route';
import { BannerRoutes } from '../modules/Banner/banner.route';
import { CategoryRoutes } from '../modules/Category/category.routes';
import { SubcategoryRoutes } from '../modules/Subcategory/subcategory.routes';
import { ProductRoutes } from '../modules/Product/product.routes';
import { ChildcategoryRoutes } from '../modules/Childcategory/childcategory.routes';
import { AddressRoutes } from '../modules/Address/address.route';
import { RoleRoutes } from '../modules/Role/role.route';
import { YTLinkRoutes } from '../modules/YTLink/ytLink.route';
import { ReviewRoutes } from '../modules/Review/review.route';
import { CustomOrderRoutes } from '../modules/CustomOrder/customOrder.route';
import { QuestionRoutes } from '../modules/Question/question.route';
import { CartRoutes } from '../modules/Cart/cart.route';
import { ComboRoutes } from '../modules/Combo/combo.route';
import { OfferRoutes } from '../modules/Offer/offer.route';
import { SearchRoutes } from '../modules/Search/search.route';
import { OrderRoutes } from '../modules/Order/order.route';
import { CouponRoutes } from '../modules/Coupon/coupon.route';
import { RefundRoutes } from '../modules/Refund/refund.route';
import { HotDealRoutes } from '../modules/HotDeals/hotDeal.route';
import { WishlistRoutes } from '../modules/Wishlist/wishlist.route';
import { AppRoutes } from '../modules/App/app.route';
import { BrandRoutes } from '../modules/Brand/brand.routes';
import { RequestOrderRoutes } from '../modules/RequestOrder/requestOrder.route';
import { CouponNotAppliedRoutes } from '../modules/CouponNotApplied/couponNotApplied.route';
import { NotificationRoutes } from '../modules/Notification/notification.route';
import { ImgOrPDFFilesToUrlLinksRoutes } from '../modules/ImgOrPDFFilesToUrlLinks/ImgOrPDFFilesToUrlLinks.route';



const router = Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: UserRoutes,
    },
    {
        path: '/admin',
        route: AdminRegRoutes,
    },
    {
        path: '/role',
        route: RoleRoutes,
    },
    {
        path: '/web-settings',
        route: WebSettingsRoutes,
    },
    {
        path: '/banner',
        route: BannerRoutes,
    },
    {
        path: '/ytLink',
        route: YTLinkRoutes,
    },
    {
        path: '/category',
        route: CategoryRoutes,
    },
    {
        path: '/subcategory',
        route: SubcategoryRoutes,
    },
    {
        path: '/childcategory',
        route: ChildcategoryRoutes,
    },
    {
        path: '/product',
        route: ProductRoutes,
    },
    {
        path: '/address',
        route: AddressRoutes,
    },
    {
        path: '/review',
        route: ReviewRoutes,
    },
    {
        path: '/question',
        route: QuestionRoutes,
    },
    {
        path: '/custom-order',
        route: CustomOrderRoutes,
    },
    {
        path: '/cart',
        route: CartRoutes,
    },
    {
        path: '/combo',
        route: ComboRoutes,
    },
    {
        path: '/hotDeal',
        route: HotDealRoutes,
    },
    {
        path: '/offer',
        route: OfferRoutes,
    },
    {
        path: '/search',
        route: SearchRoutes,
    },
    {
        path: '/order',
        route: OrderRoutes,
    },
    {
        path: '/coupon',
        route: CouponRoutes,
    },
    {
        path: '/refund',
        route: RefundRoutes,
    },
    {
        path: '/wishlist',
        route: WishlistRoutes,
    },
    {
        path: '/requestOrder',
        route: RequestOrderRoutes,
    },
    {
        path: '/app',
        route: AppRoutes,
    },
    {
        path: '/brand',
        route: BrandRoutes,
    },
    {
        path: '/coupon-not-applied',
        route: CouponNotAppliedRoutes,
    },
    {
        path: '/notification',
        route: NotificationRoutes,
    },
    {
        path: '/upload-files',
        route: ImgOrPDFFilesToUrlLinksRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;