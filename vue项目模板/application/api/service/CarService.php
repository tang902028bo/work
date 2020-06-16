<?php


namespace app\api\service;


use think\Db;

class CarService
{


    public function getFreeCarList()
    {
        $brandListArr = Db::name('dc_car')
            ->where('status', 1)
            ->field('brand_id')
            ->where('car_status', 1)
            ->group('brand_id')
            ->select();
        $brandId = [];
        foreach ($brandListArr as $brand) {
            $brandId[] = $brand['brand_id'];
        }
        $carBrandList = Db::field("id brand_id,brand_name")->name('dc_car_brand')
            ->select();
        foreach ($carBrandList as $k => $carBrand) {
            if (in_array($carBrand['brand_id'], $brandId)) {
                $carBrandList[$k]['can_use'] = 1;
            } else {
                $carBrandList[$k]['can_use'] = 2;
            }
        }
        return $carBrandList;
        
    }
}