package operations;

import java.util.ArrayList;
import java.util.Calendar;

import org.hl7.fhir.dstu3.model.Bundle;
import org.hl7.fhir.dstu3.model.CodeableConcept;
import org.hl7.fhir.dstu3.model.Coding;
import org.hl7.fhir.dstu3.model.DateTimeType;
import org.hl7.fhir.dstu3.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.dstu3.model.IdType;
import org.hl7.fhir.dstu3.model.Identifier;
import org.hl7.fhir.dstu3.model.Meta;
import org.hl7.fhir.dstu3.model.Observation;
import org.hl7.fhir.dstu3.model.Observation.ObservationComponentComponent;
import org.hl7.fhir.dstu3.model.Patient;
import org.hl7.fhir.dstu3.model.Quantity;
import org.hl7.fhir.dstu3.model.Reference;
import org.hl7.fhir.instance.model.api.IBaseOperationOutcome;
import org.hl7.fhir.instance.model.api.IIdType;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.model.primitive.IdDt;
import ca.uhn.fhir.rest.api.MethodOutcome;
import ca.uhn.fhir.rest.client.api.IGenericClient;
import ca.uhn.fhir.rest.server.exceptions.ResourceVersionConflictException;


public class FhirClient {
	
	
	public String SERVER_URL = "http://fhirtest.uhn.ca/baseDstu3";
	

	public FhirContext ctx = FhirContext.forDstu3();
	
	IGenericClient client = ctx.newRestfulGenericClient(SERVER_URL);
	public ca.uhn.fhir.parser.IParser jsonParser = ctx.newJsonParser();
	public ca.uhn.fhir.parser.IParser xmlParser = ctx.newXmlParser();
	
	public FhirClient() {
		jsonParser.setPrettyPrint(true);
		xmlParser.setPrettyPrint(true);
	}

	public MethodOutcome create() {
		
		IdDt idDt = IdDt.newRandomUuid();
		Patient patient = new Patient();
		patient.addIdentifier()
		   .setSystem("http://acme.org/mrns")
		   .setValue("96385");
		patient.addName()
		   .setFamily("Jameson")
		   .addGiven("Jay")
		   .addGiven("Jonathan");
		patient.setGender(AdministrativeGender.MALE);
		patient.setId(idDt);
		
		MethodOutcome outcome = null;
		
		outcome = client.create()
				   .resource(patient)
				   .prettyPrint()
				   .encodedXml()
				   .execute();
		


		Observation observation = new Observation();
		
		observation.setId(new IdType().setValue("blood-pressure"));
		
		observation.setMeta(new Meta().setVersionId("1"));
		
		//identifier
		Identifier identifier = new Identifier()
				.setSystem("urn:ietf:rfc:3986")
				.setValue("urn:uuid:187e0c12-8dd2-67e2-99b2-bf273c878281");
		
		
		ArrayList<Identifier> identifierList = new ArrayList<Identifier>();
		identifierList.add(identifier);
		observation.setIdentifier(identifierList);
		//status
		observation.setStatus(new Observation.ObservationStatusEnumFactory().fromCode("preliminary"));
		
		//category
		/*ArrayList<CodeableConcept> codeableConceptList = new ArrayList<>();
		CodeableConcept codeableConceptCat = new CodeableConcept();
		codeableConceptCat.addCoding(new Coding()
				.setSystem("http://hl7.org/fhir/observation-category")
				.setCode("vital-signs")
				.setDisplay("Vital Signs"));*/
		
		observation.addCategory().addCoding(new Coding()
				.setSystem("http://hl7.org/fhir/observation-category")
				.setCode("vital-signs")
				.setDisplay("Vital Signs"));
	
		
		
		

		//code
		CodeableConcept codeableConcept = new CodeableConcept();
		codeableConcept.addCoding()
			.setSystem("http://loinc.org")
			.setCode("85354-9")
			.setDisplay("Bood pressure panel with all children optional");
		
		codeableConcept.setText("Blood pressure systolic & diastolic");
		observation.setCode(codeableConcept);
		
		
		//subject
		observation.setSubject(new Reference("Patient/" + outcome.getId().getIdPart()));
		
		
		//effectiveDateTime
		observation.setEffective(new DateTimeType(Calendar.getInstance().getTime()));
		
		//interpretation
		
		CodeableConcept codeableConceptInterpretation = new CodeableConcept();
		codeableConceptInterpretation.addCoding()
			.setSystem("http://hl7.org/fhir/v2/0078")
			.setCode("L")
			.setDisplay("low");
		
		codeableConceptInterpretation.setText("Below low normal");
		observation.setInterpretation(codeableConceptInterpretation);
		
		
		//bodySite
		CodeableConcept codeableConceptBodySite = new CodeableConcept();
		codeableConceptBodySite.addCoding()
			.setSystem("http://snomed.info/sct")
			.setCode("368209003")
			.setDisplay("Right arm");
		observation.setBodySite(codeableConceptBodySite);
		
		//component
		CodeableConcept codeableConceptComponent = new CodeableConcept();
		codeableConceptComponent.addCoding()
			.setSystem("http://loinc.org")
			.setCode("8480-6")
			.setDisplay("Systolic blood pressure");
		
		codeableConceptComponent.addCoding()
		.setSystem("http://snomed.info/sct")
		.setCode("271649006")
		.setDisplay("Systolic blood pressure");
		
		codeableConceptComponent.addCoding()
		.setSystem("http://acme.org/devices/clinical-codes")
		.setCode("bp-s")
		.setDisplay("Systolic Blood pressure");
		
		
		
		ObservationComponentComponent occ = new ObservationComponentComponent();
		occ.setCode(codeableConceptComponent);
		
		observation.addComponent(occ);
		
		//value
		observation.setValue(
		   new Quantity()
		      .setValue(107)
		      .setUnit("mmHg")
		      .setSystem("http://unitsofmeasure.org")
		      .setCode("mm[Hg]"));
		
		//code
		CodeableConcept codeableConceptCode = new CodeableConcept();
		codeableConceptCode.addCoding()
			.setSystem("http://loinc.org")
			.setCode("8462-4")
			.setDisplay("Diastolic blood pressure");
		observation.setCode(codeableConceptCode);
		
		
		//dataAbsent Reason
		CodeableConcept codeableConceptDataAbsReason = new CodeableConcept();
		codeableConceptDataAbsReason.addCoding()
			.setSystem("http://hl7.org/fhir/data-absent-reason")
			.setCode("not-performed")
			.setDisplay("Not Performed");
		observation.setDataAbsentReason(codeableConceptDataAbsReason);
		
		
		System.out.println(jsonParser.encodeResourceToString(observation));
		
		outcome = client.create()
				   .resource(observation)
				   .prettyPrint()
				   .encodedXml()
				   .execute();
		
		
		
		
		return outcome;

		
				
	}
	
	private MethodOutcome updateById(IIdType id) {
		
		Observation observation  = client.read()
                .resource(Observation.class)
                .withId(id)
                .execute();
		
		observation.setStatus(new Observation.ObservationStatusEnumFactory().fromCode("final"));
		 
		CodeableConcept codeableConceptDataAbsReason = new CodeableConcept();
		codeableConceptDataAbsReason.addCoding()
			.setSystem("http://hl7.org/fhir/data-absent-reason")
			.setCode("not-performed")
			.setDisplay("Not Performed");
		observation.setDataAbsentReason(codeableConceptDataAbsReason);
	
		 
		// Invoke the server update method
		MethodOutcome outcome = client.update()
		   .resource(observation)
		   .withId(id)
		   .execute();
		 
		return outcome;
	
	}
	
	public IBaseOperationOutcome deleteById(IIdType id) {
		
		
		try {
			IBaseOperationOutcome resp = client.delete()
					.resourceById(id).execute();
			return resp;
		}catch(ResourceVersionConflictException e) {
		
			
			/*Observation observation = client.read()
					.resource(Observation.class)
					.withId(id)
					.execute();*/
			
			Patient patient = client.read()
                    .resource(Patient.class)
                    .withId(new IdDt("Patient", id.getIdPart()))
                    .execute();
			
			IBaseOperationOutcome resp = client.delete()
					.resource(patient)
					.execute();
			
			System.out.println("Patient deleted " + resp.getIdElement());
			System.out.println("Patient deleted " + resp.getMeta());
			
			
			IBaseOperationOutcome respObs = client.delete()
					.resourceById(id).execute();
			
			return respObs;

			
		}
		
	}


	
	public Bundle readVitalSigns() {
					
		//String url = "http://hapi.fhir.org/baseDstu3/Observation?category=vital-signs";
		Bundle outcome = client.search()
				.forResource(Observation.class)
				.where(Observation.CATEGORY.exactly().systemAndCode("http://hl7.org/fhir/observation-category", "vital-signs"))
				.returnBundle(Bundle.class)
				.execute();
		
		return outcome;
		
		
	}
	
	public Observation readWithIIdType(IIdType id) {
		return client.read()
				.resource(Observation.class)
				.withId(id)
				.execute();
	}
	
	public Bundle readWithIdentifier(String system, String value) {
		return client.search()
				.forResource(Observation.class)
				.where(Observation.IDENTIFIER.exactly().systemAndIdentifier(system, value))
				.returnBundle(Bundle.class)
				.execute();
	}
	
	public Observation readWithId(String id, String version) {
		return client.read()
				.resource(Observation.class)
				.withIdAndVersion(id, version)
				.execute();
				
	}
	
	public static void main(String[] args) {
		//Create
		FhirClient fhirClient = new FhirClient();
		
		MethodOutcome outcomeCreate = fhirClient.create();
		
		System.out.println("Observation created: " +  outcomeCreate.getId());

		//Update
		MethodOutcome outcomeUpdate = fhirClient.updateById(outcomeCreate.getId());
		System.out.println("Observation updated: " +  outcomeUpdate.getId());
		
		
		//Read
		
		//Read Observation with iid
		Observation observation1 = fhirClient.readWithIIdType(outcomeCreate.getId());
		//Search Observation with identifier
		Bundle observationBundle = fhirClient.readWithIdentifier("urn:ietf:rfc:3986", "urn:uuid:187e0c12-8dd2-67e2-99b2-bf273c878281");
		//Read Observation with id
		Observation observation2 = fhirClient.readWithId(outcomeCreate.getId().getIdPart() ,"1");
		
		System.out.println("Observation read with IIdType: ");
		
		System.out.println(fhirClient.jsonParser.encodeResourceToString(observation1));
		
		System.out.println("Observation read with identifier: ");
		
		System.out.println(fhirClient.jsonParser.encodeResourceToString(observationBundle));
		
		System.out.println("Observation read with id: ");
		
		System.out.println(fhirClient.jsonParser.encodeResourceToString(observation2));
		
		//List all Vitalsigns
		Bundle bundle = fhirClient.readVitalSigns();
		//System.out.println(fhirClient.jsonParser.encodeResourceToString(bundle));
		
		//Delete
		//IBaseOperationOutcome outcomeDelete = fhirClient.deleteById(new IdDt("Observation", "3989317"));
		IBaseOperationOutcome outcomeDelete = fhirClient.deleteById(outcomeCreate.getId());
		System.out.println("Observation deleted : " + outcomeDelete.getIdElement());
		
	}


	



	

}
