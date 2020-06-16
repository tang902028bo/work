<?php


namespace app\api\service;


class Excel
{
    static private $cell = array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
        'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL',
        'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ');

    static private $error_excel = UPLOAD . 'excel/error/';

    static function exportAll($data, $listTitle, $is_all = 0)
    {
        $title = ['姓名', '党内职务', '每月党费金额', '部门'];
        $name = $listTitle . (!$is_all ? "(部分)" : "");
        $export_data = [];
        foreach ($data as $k => $v) {
            $export_data[] = array_values($v);
        }
        array_unshift($export_data, $title);

        $topNumber = 1;
        $obj_excel = new \PHPExcel();
        $obj_excel->getActiveSheet()->getDefaultColumnDimension()->setWidth(20);//设置列宽度
        $obj_excel->getActiveSheet()->mergeCells('A1:' . self::$cell[count($title) - 1] . '1');
        $obj_excel->setActiveSheetIndex(0)->setCellValue('A1', $name);
        $obj_excel->getActiveSheet()->getStyle('A1')->getFont()->setSize(18);

        $obj_excel->getActiveSheet()->getStyle('A1')->getAlignment()->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
        $obj_excel->getActiveSheet()->getStyle('A1')->getAlignment()->setVertical(\PHPExcel_Style_Alignment::VERTICAL_CENTER);
        foreach ($export_data as $key => $value) {
            foreach ($value as $k => $va) {
                $obj_excel->setActiveSheetIndex(0)->setCellValue(self::$cell[$k] . ($key + 1 + $topNumber), $va);
            }
        }


        header('pragma:public');
        header('Content-type:application/vnd.ms-excel;charset=utf-8;name="' .  iconv("utf-8","gb2312",$name) . '.xls"');
        header("Content-Disposition:attachment;filename=".iconv("utf-8","gb2312",$name).".xls");//attachment新窗口打印inline本窗口打印
        $objWriter = \PHPExcel_IOFactory::createWriter($obj_excel,  'Excel5');
        $objWriter->save('php://output');
        exit;
    }

}