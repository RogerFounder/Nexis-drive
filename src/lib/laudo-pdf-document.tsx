import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Laudo } from "@/generated/prisma/client";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#18181b" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingBottom: 16,
    marginBottom: 20,
  },
  brand: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  brandRight: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  subtitle: { fontSize: 9, color: "#71717a", marginTop: 2 },
  subtitleRight: { fontSize: 9, color: "#71717a", marginTop: 2, textAlign: "right" },
  fieldsRow: { flexDirection: "row", marginBottom: 20 },
  field: { marginRight: 32 },
  fieldLabel: { fontSize: 8, color: "#a1a1aa" },
  fieldValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 8, color: "#a1a1aa", marginBottom: 6 },
  checklistItem: { fontSize: 10, marginBottom: 3 },
  bodyText: { fontSize: 10, lineHeight: 1.5 },
  warrantyBox: { backgroundColor: "#fafafa", padding: 14, borderRadius: 6 },
  warrantyText: { fontSize: 8, lineHeight: 1.5, color: "#52525b" },
  signatureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 50 },
  signatureBox: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#a1a1aa",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 8,
    color: "#71717a",
  },
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface LaudoPdfDocumentProps {
  laudo: Laudo;
  warrantyText: string;
}

export function LaudoPdfDocument({ laudo, warrantyText }: LaudoPdfDocumentProps) {
  return (
    <Document title={`Laudo Técnico #${laudo.numero}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>Nexus Drive</Text>
            <Text style={styles.subtitle}>Laudo Técnico de Entrada</Text>
          </View>
          <View>
            <Text style={styles.brandRight}>Nº {laudo.numero}</Text>
            <Text style={styles.subtitleRight}>{DATE_FORMATTER.format(laudo.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.fieldsRow}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CLIENTE</Text>
            <Text style={styles.fieldValue}>{laudo.clienteNome}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>WHATSAPP</Text>
            <Text style={styles.fieldValue}>{laudo.clienteWhatsapp}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{laudo.identificadorLabel.toUpperCase()}</Text>
            <Text style={styles.fieldValue}>{laudo.identificadorValor}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONDIÇÕES REGISTRADAS NA ENTRADA</Text>
          {laudo.itensChecklist.length > 0 ? (
            laudo.itensChecklist.map((item) => (
              <Text key={item} style={styles.checklistItem}>
                ✓ {item}
              </Text>
            ))
          ) : (
            <Text style={styles.bodyText}>Nenhuma avaria visível registrada na entrada.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBSERVAÇÕES</Text>
          <Text style={styles.bodyText}>{laudo.observacoesEntrada}</Text>
        </View>

        <View style={[styles.section, styles.warrantyBox]}>
          <Text style={styles.sectionTitle}>GARANTIA E TERMOS DE RESPONSABILIDADE</Text>
          <Text style={styles.warrantyText}>{warrantyText}</Text>
        </View>

        <View style={styles.signatureRow}>
          <Text style={styles.signatureBox}>Técnico Responsável</Text>
          <Text style={styles.signatureBox}>{laudo.clienteNome} (Cliente)</Text>
        </View>
      </Page>
    </Document>
  );
}
